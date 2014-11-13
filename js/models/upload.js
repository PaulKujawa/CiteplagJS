App.Upload = DS.Model.extend({
    contentAsHtml: DS.attr('string')
});

App.Upload.FIXTURES = [ /* TODO needs to be replaced */
    {
        id: 1,
        contentAsHtml: '<span>some content from xml file</span>'
    }, {
        id: 2,
        title: 'qwd'
    }, {
        id: 3,
        title: 'profit'
    }
];

