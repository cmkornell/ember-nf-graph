import Ember from 'ember';
import HasGraphParent  from 'ember-nf-graph/mixins/graph-has-graph-parent';

import layout from '../templates/components/bb-label-bar';

export default Ember.Component.extend(HasGraphParent, {
  tagName: 'g',

  layout: layout,
  template: null,

  useDefaultTemplate: Ember.computed.equal('template', null),
  labelPadding: 3,
  width: 40,

  orient: 'right',

  attributeBindings: ['transform'],

  classNameBindings: [':bb-label-bar', 'isOrientRight:orient-right:orient-left'],

  /**
    computed property. returns true if `orient` is equal to `'right'`.
    @property isOrientRight
    @type Boolean
    @readonly
  */
  isOrientRight: Ember.computed.equal('orient', 'right'),


  /**
    The SVG transform for positioning the component.
    @property transform
    @type String
    @readonly
  */
  transform: Ember.computed('x', 'y', function(){
    var x = this.get('x');
    var y = this.get('y');
    return `translate(${x} ${y})`;
  }),

  /**
    The x position of the component
    @property x
    @type Number
    @readonly
  */
  x: Ember.computed(
    'orient',
    'graph.width',
    'width',
    'graph.paddingLeft',
    'graph.paddingRight',
    function(){
      var orient = this.get('orient');
      if(orient !== 'left') {
        return this.get('graph.width') - this.get('width') - this.get('graph.paddingRight');
      }
      return this.get('graph.paddingLeft');
    }
  ),

  /**
    The y position of the component
    @property y
    @type Number
    @readonly
  */
  y: Ember.computed.alias('graph.graphY'),

  /**
    the height of the component
    @property height
    @type Number
    @readonly
  */
  height: Ember.computed.alias('graph.height'),

  init() {
    this._super(...arguments);

    Ember.deprecate('Non-block form of label bar is deprecated. Please add `as |label|` to your template.', this.get('template.blockParams'));
  },

  /**
    The x position of the axis line.
    @property axisLineX
    @type Number
    @readonly
  */
  axisLineX: Ember.computed('isOrientRight', 'width', function(){
    return this.get('isOrientRight') ? 0 : this.get('width');
  }),

  /**
    sets graph's labelBar property on willInsertElement
    @method _updateGraphLabelBar
    @private
  */
  _updateGraphLabelBar: Ember.on('willInsertElement', function(){
    this.set('graph.labelBar', this);
  }),
  _getLabelsFromGraphParent: Ember.on('didInsertElement', function(){
    var graphics = this.get('graph.graphics');
    var graphicLabels = graphics.filter(function(graphic){
      return graphic.hasLabel;
    }).map(function(label){
      return {
        x: Ember.get(label, 'labelX'),
        y: Ember.get(label, 'labelY'),
        text: Ember.get(label, 'labelText')
      }
    });

    this.set('labels', graphicsWithLabels);
  })
});
