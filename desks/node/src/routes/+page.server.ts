import { Fixture } from "$lib/server/Fixture";
import { refresh } from "$lib/server/socketIoHandler";
import type { Actions, PageServerLoad } from "./$types";
import { Bonjour, type Service } from "bonjour-service";

const dnssd = new Bonjour();
const devices: Service[] = [];

const browser = dnssd.find({ type: "scf" });
browser.on("up", (service) => {
    devices.push(service);
    refresh();
});
browser.on("down", (service) => {
    const index = devices.findIndex((device) => device === service);
    devices.splice(index, 1);
});

export const _fixtureInstances = new Map<string, Fixture>();

export const load: PageServerLoad = async () => {
    return {
        fixtures: getFixtures().map((fixture) => ({
            ...fixture,
            connected: _fixtureInstances.has(fixture.ip),
        })),
    };
};

export const actions: Actions = {
    connect: async ({ request }) => {
        const ip = (await request.formData()).get("ip") as string;
        const fixture = new Fixture(ip);
        const handshake = await fixture.handshake();
        if (handshake.success) {
            _fixtureInstances.set(ip, fixture);
        } else {
            console.log("Handshake failed");
        }
    },
};

function getFixtures() {
    return devices
        .map((device) => ({
            manufacturer: device.txt.manufacturer,
            model: device.txt.model,
            version: device.txt.version,
            serial: device.txt.serial,
            ip: (device.addresses || []).find((address) => address.includes("."))!,
        }))
        .filter((fixture) => fixture.ip);
}
