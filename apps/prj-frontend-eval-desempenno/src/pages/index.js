const modules = import.meta.glob("./*.jsx", { eager: false });
const pages = {};

for (const path in modules) {
  const name = path.replace("./", "").replace(".jsx", "");
  pages[name] = async () => {
    const mod = await modules[path]();
    return mod.default;
  };
}

export default pages;
