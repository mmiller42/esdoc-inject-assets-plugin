# esdoc-inject-assets-plugin

ESDoc plugin for adding custom stylesheets and scripts to the template.

## Installation

```bash
npm install esdoc-inject-assets-plugin
```

## Config

```json
{
  "plugins": [
    {
      "name": "esdoc-inject-assets-plugin",
      "option": {
        "enable": true,
        "assets": [
          "files/foo.js",
          "files/bar.css",
          "https://unpkg.com/jquery@3.2.1/dist/jquery.js",
          {
            "path": "https://fonts.googleapis.com/css?family=Roboto",
            "type": "link"
          },
          {
            "path": "node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot",
            "inject": false
          }
        ]
      }
    }
  ]
}
```

## Options

| Property            | Type                         | Description                                                                                          | Default                                    |
| :------------------ | :--------------------------- |:---------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| `enable`            | boolean                      | Set to `false` to disable the plugin.                                                                | `true`                                     |
| `assets`            | Array.&lt;string\|object&gt; | An array of CSS and JS files to inject. If a string is provided, it is assumed to be the asset path. | `[]`                                       |
| `assets[].path`     | string                       | The relative path (or absolute URL) to the CSS or JS file to inject.                                 | *Required*                                 |
| `assets[].type`     | string                       | One of `'link'` or `'script'`.                                                                       | Inferred from the file extension of `path` |
| `assets[].absolute` | boolean                      | If `true`, will not prepend a local path.                                                            | Inferred if `path` looks like a URL        |
| `assets[].copy`     | boolean                      | If `true`, will copy the asset into the destination directory in `assets/`.                          | `true`, unless `absolute`                  |
| `assets[].inject`   | boolean                      | If `false`, will copy the file but not inject a tag.                                                 | `true`                                     |
| `assets[].attrs`    | Object.&lt;string,string&gt; | Attributes to add to the link or script element.                                                     | `{}`                                       |
