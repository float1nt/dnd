# GUI Sync

The control panel is a local browser interface. Browser security prevents a plain HTML file from silently writing arbitrary project files, so the durable Markdown files are synchronized through the bundled Node script.

## Browser to Markdown

1. In `control-panel/index.html`, click `导出同步包`.
2. Run:

```sh
node scripts/sync-campaign-bundle.mjs from-json /path/to/bg3-dm-bundle.json
```

This writes each campaign into `campaigns/<campaign-id>/` and refreshes `campaigns/index.md`.

## Markdown to Browser

Run:

```sh
node scripts/sync-campaign-bundle.mjs to-json /path/to/bg3-dm-bundle.json
```

Then use `导入同步包` in the control panel. The reverse import intentionally rebuilds the campaign shell and live state first; detailed entities can be added by the DM or expanded by the sync script as the Markdown schema grows.

The JSON bundle is an interchange file, not the authoritative memory. The Markdown files under `campaigns/` remain authoritative for DM continuity.

The local rules catalog and map blueprints live in `references/rules-catalog.json` and `references/map-materials.json`; they are shared reference material and should not be copied into a campaign's live state unless the party has discovered or used them.
