import net from "node:net";
import { Buffer } from "node:buffer";
import { CommandMessageSchema, ResponseMessageSchema, type CommandMessage, type ResponseMessage } from "../protobuf/fixture_pb";
import { toBinary, create, fromBinary } from "@bufbuild/protobuf";

type Listener = {
    filter: (message: ResponseMessage) => boolean;
    callback: (message: ResponseMessage) => void;
};

type WithoutNeverProperties<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
};

// remove all properties starting with "$"
type Clean<T> = {
    [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

export class Fixture {
    private client: net.Socket;
    private messageListeners: Listener[] = [];
    private blobListener: ((buffer: Buffer) => void) | null = null;
    private messageQueue: Buffer[] = [];

    constructor(public ip: string) {
        this.client = new net.Socket();
        this.client.connect(4284, ip, () => {});
        let dataBuffer = Buffer.alloc(0) as any;
        this.client.on("data", (data) => {
            dataBuffer = Buffer.concat([dataBuffer, data]);
            while (dataBuffer.length >= 4) {
                const length = dataBuffer.readUInt32LE(0);
                if (dataBuffer.length >= length + 4) {
                    const protobuf = dataBuffer.subarray(4, 4 + length);
                    dataBuffer = dataBuffer.subarray(4 + length);
                    this.messageQueue.push(protobuf);
                }
            }
            this.handleNextQueueMessage();
        });
        this.client.on("error", (e) => {
            console.log("An error occurred", e);
        });
    }

    private handleNextQueueMessage() {
        if (this.messageQueue.length === 0) {
            return;
        }
        const messageBuffer = this.messageQueue.shift()!;
        if (this.blobListener) {
            this.blobListener(messageBuffer);
            this.blobListener = null;
        } else {
            const message = fromBinary(ResponseMessageSchema, messageBuffer);

            for (const listener of this.messageListeners) {
                if (listener.filter(message)) {
                    listener.callback(message);
                    this.messageListeners = this.messageListeners.filter((l) => l !== listener);
                }
            }
        }
        if (this.messageQueue.length > 0) {
            this.handleNextQueueMessage();
        }
    }

    public getInfo() {
        this.sendMessage({ command: { case: "getInfo", value: {} } });
        return this.waitForMessageAndReturn("info");
    }
    public handshake() {
        this.sendMessage({ command: { case: "handshake", value: {} } });
        return this.waitForMessageAndReturn("handshake");
    }
    public async getDefinition() {
        this.sendMessage({ command: { case: "getFixtureDefinition", value: {} } });
        const data = await this.waitForMessageAndReturn("fixtureDefinition", true);
        const json = JSON.parse(data.blob.toString());
        return json as {
            emitters: { name: string; type: string; attributes: Record<string, { name: string; type: string }> }[];
        };
    }
    public getCurrentAttributeValues() {
        this.sendMessage({ command: { case: "getAllAttributeValues", value: {} } });
        return this.waitForMessageAndReturn("attributeValues");
    }
    public setAttributeValue(attributeId: number, value: number) {
        this.sendMessage({ command: { case: "setAttributeValue", value: { data: { attributeId, value: { case: "intValue", value } } } } });
    }

    private waitForMessageAndReturn<T extends ResponseMessage["response"]["case"], B extends boolean>(filter: T, containsBlob?: B): Promise<WithoutNeverProperties<Clean<Extract<ResponseMessage["response"], { case: T }>["value"]> & { blob: B extends true ? Buffer : never }>> {
        return new Promise((resolve) => {
            this.messageListeners.push({
                filter: (message) => message.response.case === filter,
                callback: (message) => {
                    if (containsBlob) {
                        this.blobListener = (buffer) => {
                            resolve({ ...this.clean(message.response.value), blob: buffer } as any);
                        };
                        return;
                    }
                    resolve(this.clean(message.response.value) as any);
                },
            });
        }) as any;
    }

    private sendMessage(message: Parameters<typeof create<typeof CommandMessageSchema>>[1]) {
        const serialized = toBinary(CommandMessageSchema, create(CommandMessageSchema, message));
        const length = Buffer.alloc(4);
        length.writeUInt32LE(serialized.length, 0);
        const result = Buffer.concat([length as any, serialized]) as any;
        this.client.write(result);
    }

    private clean<T extends undefined | Record<string, any>>(obj: T): Clean<T> {
        if (!obj || typeof obj !== "object") {
            return obj as any;
        }
        if (Array.isArray(obj)) {
            return obj.map((value) => (typeof value === "object" ? this.clean(value) : value)) as any;
        }
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([key]) => !key.startsWith("$"))
                .map(([key, value]) => [key, typeof value === "object" ? this.clean(value) : value])
        ) as any;
    }
}
