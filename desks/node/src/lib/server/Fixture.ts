import net from "node:net";
import { Buffer } from "node:buffer";
import { CommandMessageSchema, ResponseMessageSchema, type CommandMessage, type ResponseMessage } from "../protobuf/fixture_pb";
import { toBinary, create, fromBinary } from "@bufbuild/protobuf";

type Listener = {
    filter: (message: ResponseMessage) => boolean;
    callback: (message: ResponseMessage) => void;
};

// remove all properties starting with "$"
type Clean<T> = {
    [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

export class Fixture {
    private client: net.Socket;
    private messageListeners: Listener[] = [];

    constructor(public ip: string) {
        this.client = new net.Socket();
        this.client.connect(4284, ip, () => {});
        let dataBuffer = Buffer.alloc(0) as any;
        this.client.on("data", (data) => {
            dataBuffer = Buffer.concat([dataBuffer, data]);
            if (dataBuffer.length >= 4) {
                const length = dataBuffer.readUInt32LE(0);
                if (dataBuffer.length >= length + 4) {
                    const protobuf = dataBuffer.subarray(4, 4 + length);
                    dataBuffer = dataBuffer.subarray(4 + length);
                    const message = fromBinary(ResponseMessageSchema, protobuf);

                    for (const listener of this.messageListeners) {
                        if (listener.filter(message)) {
                            listener.callback(message);
                            this.messageListeners = this.messageListeners.filter((l) => l !== listener);
                            return;
                        }
                    }
                }
            }
        });
        this.client.on("error", (e) => {
            console.log("An error occurred", e);
        });
    }

    public getInfo() {
        this.sendMessage({ command: { case: "getInfo", value: {} } });
        return this.waitForMessageAndReturn("info");
    }
    public handshake() {
        this.sendMessage({ command: { case: "handshake", value: {} } });
        return this.waitForMessageAndReturn("handshake");
    }

    private waitForMessageAndReturn<T extends ResponseMessage["response"]["case"]>(filter: T): Promise<Clean<Extract<ResponseMessage["response"], { case: T }>["value"]>> {
        return new Promise((resolve) => {
            this.messageListeners.push({
                filter: (message) => message.response.case === filter,
                callback: (message) => {
                    resolve(message.response.value);
                },
            });
        }) as any;
    }

    private sendMessage(message: Parameters<typeof create<typeof CommandMessageSchema>>[1]) {
        const serialized = toBinary(CommandMessageSchema, create(CommandMessageSchema, message));
        const length = Buffer.alloc(4);
        length.writeUInt32LE(serialized.length, 0);
        this.client.write(Buffer.concat([length as any, serialized]) as any);
    }
}
