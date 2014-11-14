window.App = Ember.Application.create({
    LOG_TRANSITIONS: true // router writes route changes to console
});

App.ApplicationAdapter = DS.FixtureAdapter.extend();