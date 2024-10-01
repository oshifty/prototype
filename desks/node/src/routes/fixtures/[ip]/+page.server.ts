import { error, redirect } from "@sveltejs/kit";
import { _fixtureInstances } from "../../+page.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const fixture = _fixtureInstances.get(params.ip);
    if (!fixture) {
        redirect(302, "/");
    }

    return {
        ip: fixture.ip,
        info: fixture.getInfo(),
        definition: fixture.getDefinition(),
        currentAttributeValues: fixture.getCurrentAttributeValues().then((values) => {
            return Object.fromEntries(values.data.map((d) => [d.attributeId, d.value.value]));
        }),
    };
};
