module.exports = {
  theme: {
    cssVarPrefix: "",
  },
  plugins: [
    require("tailwindcss/plugin")(({ addVariant }) => {
      addVariant("!important", ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `.\\!${rule.selector.slice(1)}`;
          rule.walkDecls((decl) => {
            decl.important = true;
          });
        });
      });
    }),
  ],
};
