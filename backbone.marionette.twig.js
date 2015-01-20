_.extend(Marionette.Renderer, {
  render: function(template, data){

    if (!template) {
      var error = new Error("Cannot render the template since it's false, null or undefined.");
      error.name = "TemplateNotFoundError";
      throw error;
    }

    // If the template is a function call it with data
    if (typeof template === "function") return template(data);

    var compiledTemplate = Marionette.TemplateCache.get(template);
    if (typeof compiledTemplate === "function") return compiledTemplate(data);
    if (typeof compiledTemplate.render === "function") return compiledTemplate.render(data);
  }
});

_.extend(Marionette.TemplateCache.prototype, {
  loadExistingTwigTemplate: function(templateId) {
    return twig({
      ref: templateId
    });
  },
  loadTemplate: function(templateId) {
    // first, see if the template is already loaded
    if (this.loadExistingTwigTemplate(templateId) !== null) {
      return {
        id: templateId,
        type: 'text/twig'
      };
    }

    // second, load the template from a script tag
    // eg: <script type="text/twig" id="templateId">
    var template = {
      html: Marionette.$(templateId).html(),
      type: Marionette.$(templateId).attr('type')
    };

    if (!template.html || template.html.length === 0){
      throwError("Could not find template: '" + templateId + "'", "NoTemplateError");
    }

    return template;
  },

  compileTemplate: function(template) {
    switch (template.type) {
      case 'text/twig':
        // first, see if the template is already loaded
        var existingTemplate = this.loadExistingTwigTemplate(template.id);

        if (existingTemplate !== null) {
          return existingTemplate;
        }

        return twig({
          id: template.id,
          data: template.html,
          allowInlineIncludes: true
        });
      default: return _.template(template.html);
    }
  }
});
