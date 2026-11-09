# Material 0.16.1 · lit and complete exports

Export now offers Lit appearance · PNG, using MaterialLighting.shade with exactly the colour, height, roughness, metallic and current project lighting inputs used by the normal Lit surface preview. The output preserves the composition alpha. Colour remains the original artwork output. When Lit surface is active, the export dialog initially selects Lit appearance.

Download all · ZIP creates seven PNGs (colour, lit, height, normal, roughness, metallic, coverage), original.jagomaterial, export-settings.json and a short guide. Rendering uses a fixed document/time snapshot; it does not change the document or export the checkerboard, transform handles or temporary Before bypass. The repeated proof and selected-layer variants remain separate. Current size and normal-strength settings are used. Coverage is the complete composition alpha, not the selected mask.

Verified: lit pixels equal the preview lighting function at the same resolution; lit differs from unlit artwork; alpha is identical; real single-file and ZIP download buttons work; source document remains unchanged; all ZIP entries pass CRC and image-size checks; native WebView2 probe passes. Different render resolutions can change fine relief sampling, so match preview and export sizes for pixel comparison.

Saved separate development preview. No public release/installer replacement. Added browser regression test Source/Tests/lit-export-browser.cjs. Client files stay outside the source repository.
