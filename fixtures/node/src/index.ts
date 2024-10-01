import Bonjour from "bonjour-service";
import net from "node:net";
import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { CommandMessage, CommandMessageSchema, ResponseMessageSchema } from "./lib/protobuf/fixture_pb";

console.log("🚀 Starting...");
const instance = new Bonjour();

const TCP_PORT = 4284;
const MANUFACTURER = "TestManufacturer";
const MODEL = "ConsoleFixture1000";
const FW_VERSION = { major: 1, minor: 0, patch: 0 };
const HW_VERSION = { major: 1, minor: 0, patch: 0 };
const VERSION = `${FW_VERSION.major}.${FW_VERSION.minor}.${FW_VERSION.patch}`;
const SERIAL = "12345678";
const DNSSD_TYPE = "scf";

console.log("📡 Advertising via DNS-SD...");
instance.publish({
    name: `${MANUFACTURER} ${MODEL}`,
    type: DNSSD_TYPE,
    port: TCP_PORT,
    protocol: "tcp",
    txt: {
        manufacturer: MANUFACTURER,
        model: MODEL,
        version: VERSION,
        serial: SERIAL,
    },
});

console.log("🔌 Starting TCP server...");
const server = net.createServer((socket) => {
    let dataBuffer = Buffer.alloc(0);
    socket.on("data", (data) => {
        dataBuffer = Buffer.concat([dataBuffer, data]);
        while (dataBuffer.length >= 4) {
            const length = dataBuffer.readUInt32LE(0);
            if (dataBuffer.length >= length + 4) {
                const protobuf = dataBuffer.subarray(4, 4 + length);
                dataBuffer = dataBuffer.subarray(4 + length);
                handleMessag(fromBinary(CommandMessageSchema, protobuf), socket);
            }
        }
    });
});

server.listen(TCP_PORT);

console.log("✅ Ready");

let lampShutterOpen = false;

function handleMessag(message: CommandMessage, client: net.Socket) {
    switch (message.command.case) {
        case "getInfo":
            sendMessage(client, {
                response: {
                    case: "info",
                    value: {
                        firmwareVersion: FW_VERSION,
                        hardwareVersion: HW_VERSION,
                        manufacturer: MANUFACTURER,
                        model: MODEL,
                        serialNumber: SERIAL,
                    },
                },
            });
            break;
        case "handshake":
            sendMessage(client, {
                response: {
                    case: "handshake",
                    value: {
                        success: true,
                    },
                },
            });
            break;
        case "getFixtureDefinition":
            sendMessage(client, {
                response: {
                    case: "fixtureDefinition",
                    value: {
                        json: JSON.stringify({
                            emitters: [
                                {
                                    name: "LED",
                                    type: "light",
                                    attributes: {
                                        1: { name: "Shutter", type: "boolean" },
                                    },
                                },
                            ],
                        }),
                    },
                },
            });
            break;
        case "getAllAttributeValues":
            sendMessage(client, {
                response: {
                    case: "attributeValues",
                    value: {
                        data: [{ attributeId: 1, value: { case: "floatValue", value: lampShutterOpen ? 1 : 0 } }],
                    },
                },
            });
            break;
        case "getAttributeValue":
            if (message.command.value.attributeId === 1) {
                sendMessage(client, {
                    response: {
                        case: "attributeValue",
                        value: {
                            attributeId: 1,
                            value: { case: "floatValue", value: lampShutterOpen ? 1 : 0 },
                        },
                    },
                });
            }
            break;
        case "setAttributeValue":
            if (message.command.value.data?.attributeId === 1 && message.command.value.data.value.case === "floatValue") {
                lampShutterOpen = message.command.value.data.value.value === 1;
                console.log("Lamp shutter is now", lampShutterOpen ? "open 🌞" : "closed 🌚");
            }
            break;
        default:
            console.error("Not implemented:", message.command);
    }
}

function sendMessage(socket: net.Socket, message: Parameters<typeof create<typeof ResponseMessageSchema>>[1]) {
    const serialized = toBinary(ResponseMessageSchema, create(ResponseMessageSchema, message));
    const length = Buffer.alloc(4);
    length.writeUInt32LE(serialized.length, 0);
    socket.write(Buffer.concat([length, serialized]));
}
