# Material and Workshop: surface authoring and cloth

Development preview · Material 0.18.0 / 3D Workshop 0.7.0

Extract the preview ZIP. Open Material/Jago-Material.exe and Workshop/Jago-3D-Workshop.exe from their folders. Offline HTML editions are included. This portable preview leaves your installed suite unchanged.

## Artwork → finished surface

In Material choose **Surface workshop**, add a surface, then **Foil & impressions**. Import PNG/JPG/WebP or a self-contained outlined SVG. The SVG becomes an embedded raster mark for this treatment; keep your vector original separately.

On **Proposed finish**, choose Move, Scale or Rotate and drag directly on the preview. Shift snaps rotation to 15 degrees. Centre horizontally/vertically aligns the mark. Precise placement sliders remain beside it. Centre guides are preview-only. Apply makes one undoable edit; closing cancels the comparison.

Material's **Lit appearance** exports its shaded look. Colour and individual maps remain separate; Download all contains both and your editable project.

## Material → an object in 3D Workshop

1. In Material's Surface workshop, choose **Export for Workshop**. Selected surface layer is the default; whole composition is optional. Save the `.jagosurface` package.
2. In Workshop select the target object. Under Artwork on a surface, choose **Apply to selected object**, then **From Material** and open the package.
3. Colour, normal, roughness and metallic maps attach to that object. Geometry, placement and the scene stay intact. Basic shapes, image cards and outlined/extruded objects use their existing UV mapping; combined solids do not yet have artwork UV mapping and are explicitly excluded.
4. To revise artwork later, export another package from Material. On the object choose **Update from Material**. Its placement, sheet settings, pins, baked motion, camera and lighting are preserved.

Choose **Add a new sheet** instead when you want a flexible surface. Material source is retained with the object and can be saved out for further Material editing. This is an offline file exchange, not a live connection: Workshop shape/lighting changes do not rewrite that original source.

Material data is artistic rather than measured. Colour can contain authored highlights, so additional Workshop lighting will not match Material Lit pixel for pixel. Mapping follows the object's UVs: boxes repeat across faces and spheres wrap around. UV repeat and flow keep the surface channels together without altering other objects' copies. A thin surface is not automatically a solid printable object.

## Shape, pins, finish and lighting

Select a sheet and use the Shape / Pins / Cloth / Finish / Lighting shortcuts above its controls. Pose presets, bends, folds, curl and soft pulls remain editable. Drag to pose commits one pull on release; Escape cancels it.

Under **Movable attachment pins**, add two top pins and show their numbered handles. Drag a handle in the scene to reposition its attachment. Precise attachment coordinates and offsets are also available. Release preset edge if you want only custom pins holding the sheet. Moving pins changes the starting configuration and invalidates the existing physics bake; Undo can restore it.

In **Light & camera**, Product staging provides paper/daylight, leather/grazing-light and foil/reflection starting points. These alter the scene and camera, preserving object transforms. Undo restores the previous stage. Fine lighting controls stay below.

## Cloth physics

Open **Cloth physics**, choose a feel and adjust gravity, wind, bend resistance and damping. Choose a local floor/sphere collision guide if useful, then **Simulate & bake motion**. Previous motion stays until the bake completes. Cancel keeps it unchanged.

The solver uses fixed time steps with structural, shear and bend-distance constraints. Once baked, Play and the timeline sample saved positions instead of continuing a live simulation. Choose Object motions to view the cloth without rotating the entire set. Freeze this cloth frame keeps one sampled pose; Remove baked motion returns to the editable starting shape and gentle wind.

Bakes cover up to 12 simulated seconds at 24 fps; longer composition clips retime that motion. Exact frame export samples the same saved positions. A simulation does not automatically return to its starting shape, so it is not inherently a seamless loop. Bake/settings, original source, sheet and scene are saved in the Workshop project.

The current solver is for creative cloth studies: rectangular sheets, up to eight attachment pins and local floor/sphere guides. It does not simulate self-collision, garment seams or collisions with arbitrary scene objects. Alpha cut-outs change appearance, not the physical sheet mesh. Collision guides are in sheet-local coordinates, independent of the scene's ground. Sheets still have no solid thickness and are excluded from printing.

## Examples and testing

**Signal** includes an original printed-cloth design, Material package and baked Workshop project. **Walnut** demonstrates a Material surface applied to a block and sphere. Open source projects through their app's Open command; import surface packages through From Material.

Try changing a mark, applying the surface to an object, revising its maps without losing the scene, moving a pin, baking, cancelling, freezing, Undo, save/reopen and export. Other-PC, mixed-DPI and long-session testing remains useful. Generated material maps, cloth motion and lighting are creative approximations rather than fabrication guarantees.

## Ocean foam update

Workshop and the included Pulse 0.12.2 preview share the revised ocean foam. Find coverage, patch size and residue in the existing water controls. Foam follows wave crests with irregular rounded detail and repeatable residue. See Docs/Ocean-Foam.md in either folder. This is an analytic appearance, not shoreline or fluid simulation.
