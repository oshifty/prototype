import type { RequestHandler } from "./$types";
import { _fixtureInstances } from "../../../+page.server";

export const POST: RequestHandler = async ({ params, request }) => {
    const ip = params.ip;
    const fixture = _fixtureInstances.get(ip);
    if (!fixture) {
        return new Response(JSON.stringify({ success: false }), { status: 404 });
    }
    const json = await request.json();
    const attribute = parseInt(json.attributeId);
    const value = parseFloat(json.value);

    fixture.setAttributeValue(attribute, value);

    return new Response(JSON.stringify({ success: true }));
};
