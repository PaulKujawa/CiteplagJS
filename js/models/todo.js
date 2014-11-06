Uploads.Todo = DS.Model.extend({
    title: DS.attr('string'),
    isCompleted: DS.attr('boolean')
});

Uploads.Todo.FIXTURES = [
    {
        id: 1,
        title: 'Learn ember',
        isCompleted: true
    }, {
        id: 2,
        title: '...',
        isCompleted: false
    }, {
        id: 3,
        title: 'profit',
        isCompleted: false
    }
];
