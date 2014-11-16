App.CollusionFile = DS.Model.extend({
    title: DS.attr('string'),
    suspiciousFile: DS.belongsTo('compareFiles'),
    sourceFile: DS.belongsTo('compareFiles')
});