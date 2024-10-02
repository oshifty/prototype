import fs from "fs/promises";
import { spawnSync } from "child_process";

await fs.cp("protobuf/nanopb/generator/proto/nanopb.proto", "protobuf/nanopb.proto");
await fs.cp("protobuf/nanopb/generator/proto/google", "protobuf/google", { recursive: true });

const folders = ["desks/node", "fixtures/node"];
for (const folder of folders) {
    await fs.rm(`${folder}/src/lib/protobuf`, { recursive: true, force: true });
    spawnSync(`npx buf generate`, { cwd: folder, shell: true });

    const filePath = `${folder}/src/lib/protobuf/fixture_pb.ts`;
    const data = await fs.readFile(filePath, "utf-8");
    const cleanedData = data.replace('import { file_nanopb } from "./nanopb_pb";\n', "").replace(", [file_nanopb]", "");

    await fs.writeFile(filePath, cleanedData);
}
