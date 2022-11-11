import type { Config } from "mtos";
import { basename, join, relative } from "path";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";

export type PluginOptions = {
  cdn?: boolean | string;
  cdnLink?: string;
  customJs?: string | string[];
  customCss?: string | string[];
  customStyle?: string;
  customScript?: string;
  customHead?: string | string[];
} & Config;

export interface ResolvedOptions extends PluginOptions {
  customJs: string[];
  customCss: string[];
  customHead: string[];
}

export type EleventyConfig = {
  dir?: {
    output?: string;
  };
  addTransform(
    id: string,
    fn: (content: string, outputPath: string) => Promise<string>
  ): void;
};

function injectMtoS(content: string, link: string, ...others: string[]) {
  const script = `<script src="${link}"></script>` + others.join("");
  return content.replace(/(?=<\/head>)/, script);
}

function toArray(i: string | undefined | string[]): string[] {
  return Array.isArray(i) ? i : i ? [i] : [];
}

function resolveOptions(options: PluginOptions): ResolvedOptions {
  return {
    ...options,
    customJs: toArray(options.customJs),
    customCss: toArray(options.customCss),
    customHead: toArray(options.customHead),
  };
}

export default function mtos(
  eleventyConfig: EleventyConfig,
  options: PluginOptions = {}
) {
  const outDir = eleventyConfig.dir?.output || "_site";
  const workingDir = process.cwd();
  const assetsDir = join(workingDir, outDir, "assets");
  const resolvedOptions = resolveOptions(options);

  let created = false;

  eleventyConfig.addTransform("mtos", async (content, outputPath) => {
    if (outputPath && outputPath.endsWith(".html")) {
      const staticFile = (name: string) =>
        `${relative(outputPath, assetsDir).slice(3)}/${name}`;

      if (!created) {
        if (!existsSync(assetsDir)) mkdirSync(assetsDir);

        if (!resolvedOptions.cdn && !resolvedOptions.cdnLink) {
          writeFileSync(
            join(assetsDir, "mtos.js"),
            __mtos__ + (resolvedOptions.customScript || "")
          );
        }

        if (resolvedOptions.customStyle)
          writeFileSync(
            join(assetsDir, "mtos.css"),
            resolvedOptions.customStyle
          );

        resolvedOptions.customCss.forEach((i) =>
          copyFileSync(i, join(assetsDir, basename(i)))
        );
        resolvedOptions.customJs.forEach((i) =>
          copyFileSync(i, join(assetsDir, basename(i)))
        );

        created = true;
      }

      return injectMtoS(
        content,
        options.cdnLink || (options.cdn ? __mtosCDN__ : staticFile("mtos.js")),
        ...(options.customStyle
          ? [`<link rel="stylesheet" href="${staticFile("mtos.css")}">`]
          : []),
        ...resolvedOptions.customCss.map(
          (i) => `<link rel="stylesheet" href="${staticFile(basename(i))}">`
        ),
        ...resolvedOptions.customJs.map(
          (i) => `<script src="${staticFile(basename(i))}"></script>`
        ),
        ...resolvedOptions.customHead
      );
    }

    return content;
  });
}
