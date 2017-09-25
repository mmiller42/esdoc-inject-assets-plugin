const assert = require('assert')
const fs = require('fs')
const path = require('path')

const VALID_TYPES = ['script', 'link']
const EXT_MAP = { '.js': 'script', '.css': 'link' }
const ESCAPE_CHAR_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}

module.exports = {
  onStart(event) {
    this._config = Object.assign(
      {},
      {
        enable: true,
        assets: [],
      },
      event.data.option
    )

    this._filesToCopy = []

    assert(typeof this._config.enable === 'boolean', 'option.enable must be a boolean')
    assert(Array.isArray(this._config.assets), 'option.assets must be an array')

    this._config.assets = this._config.assets
      .map((asset, i) => {
        if (typeof asset === 'string') {
          asset = { path: asset }
        }

        const inferredType = EXT_MAP[path.extname(asset.path)]
        const isUrl = /^(https?:)?\/\//.test(asset.path)
        asset = Object.assign({}, { type: inferredType, absolute: isUrl, copy: !isUrl, inject: true, attrs: {} }, asset)

        assert(typeof asset === 'object' && asset !== null, `option.assets[${i}] must be an object`)
        assert(typeof asset.path === 'string', `option.assets[${i}].path must be a string`)
        assert(
          asset.inject && VALID_TYPES.indexOf(asset.type) > -1,
          `option.assets[${i}].type must be one of ${VALID_TYPES.join(', ')}`
        )
        assert(typeof asset.absolute === 'boolean', `option.assets[${i}].absolute must be  boolean`)
        assert(typeof asset.copy === 'boolean', `option.assets[${i}].copy must be a boolean`)
        assert(!asset.copy || !asset.absolute, `option.assets[${i}].copy may not be true if absolute is true`)
        assert(typeof asset.inject === 'boolean', `option.assets[${i}].inject must be a boolean`)
        assert(
          typeof asset.attrs === 'object' && asset.attrs !== null,
          `options.assets[${i}].attrs must be an object or undefined`
        )

        if (asset.copy) {
          this._filesToCopy.push(asset.path)
        }

        return asset.inject ? asset : null
      })
      .filter(asset => asset)
  },

  onHandleContent(event) {
    if (!this._config.enable || this._config.assets.length === 0) {
      return
    }

    if (path.extname(event.data.fileName) !== '.html') {
      return
    }

    const links = []
    const scripts = []

    this._config.assets.forEach(asset => {
      const href = asset.absolute ? asset.path : `assets/${asset.path}`
      if (asset.type === 'link') {
        links.push(Object.assign({ rel: 'stylesheet' }, asset.attrs, { href: href }))
      } else {
        scripts.push(Object.assign({}, asset.attrs, { src: href }))
      }
    })

    let html = event.data.content

    const escapeValue = value => value.replace(/[&<>"']/g, char => ESCAPE_CHAR_MAP[char])
    const buildAttrs = attrs =>
      Object.keys(attrs)
        .map(attr => `${attr}="${escapeValue(attrs[attr])}"`)
        .join(' ')

    if (links.length > 0) {
      const tags = links.map(attrs => `<link ${buildAttrs(attrs)}>`)
      html = html.replace(/<\/head>/i, `${tags.join('\n')}\n</head>`)
    }
    if (scripts.length > 0) {
      const tags = scripts.map(attrs => `<script ${buildAttrs(attrs)}></script>`)
      html = html.replace(/<\/body>/i, `${tags.join('\n')}\n</body>`)
    }

    event.data.content = html
  },

  onPublish(event) {
    if (!this._config.enable || this._filesToCopy.length === 0) {
      return
    }

    this._filesToCopy.forEach(filePath => {
      const data = fs.readFileSync(filePath, 'utf8')
      event.data.writeFile(`assets/${filePath}`, data)
    })
  },
}
