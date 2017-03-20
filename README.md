# svg

A Powerful SVG Langauge Support Extension(beta).

## Features

### SVG Elements Auto Completion.

![feature 1](images/f1.png)

### SVG Attributes Auto Completion.

![feature 2](images/f2.png)

### Document Symbol with SVG Element [id].

![feature 3](images/f3.png)

### SVG Preview

![feature 4](images/f4.png)

> Tip: All Completion list is context, will not show all items.

### Rename Tag Name or Id Reference.

Cursor in Tag Name or Id Attribute or url(#id) Hit F2(Windows) Key, Rename it!

### In Id Reference Click Goto id="" element.

Hot Ctrl Key and Move mouse to a url(#id), That it!

### SVG Format Support
Formatting support using SVGO, which can prettify SVGs and sort tag attributes. 

**Thanks to [LaurentTreguier](https://github.com/LaurentTreguier) for sharing SVG formatting features**

## Known Issues

Configuration option functionality is not yet implemented.

## Update History

### 0.0.5
* Add url(#id) Definition Provider.

### 0.0.4
* Add New Rename Provider.

### 0.0.3
* New Hover Info Support.
* Improve Completion list in paint show color keywords.
* Improve Completion list work like snipple (For base sharp). Required vscode >=1.8 .
* The `svg.completion.showDeprecated` Configuration item is actived, will not show deprecated item in completion list by default(`false`).

### 0.0.2

* Improve Preview.
* Improve Id Symbol show `[tag]#[id]` and fix a bug.

### 0.0.1

* Initial release.

-----------------------------------------------------------------------------------------------------------
## For more information

* [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)

**Enjoy!**