# lens-extensions

##Lens "FluxV2" Extension

### Install

```
mkdir -p ~/.k8slens/extensions
git clone https://github.com/stevejr/lens-extensions.git
ln -s $(pwd)/lens-extensions/fluxv2 ~/.k8slens/extensions/fluxv2
cd $(pwd)/lens-extensions/fluxv2
npm run build
```

You can now start Lens and you should see the FluxV2 extension present.
