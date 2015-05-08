import Ember from 'ember';
import HasGraphParent from 'ember-nf-graph/mixins/graph-has-graph-parent';

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
  transform: Ember.computed('x', 'y', function() {
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
    function() {
      var orient = this.get('orient');
      if (orient !== 'left') {
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
  axisLineX: Ember.computed('isOrientRight', 'width', function() {
    return this.get('isOrientRight') ? 0 : this.get('width');
  }),

  /**
    sets graph's labelBar property on willInsertElement
    @method _updateGraphLabelBar
    @private
  */
  _updateGraphLabelBar: Ember.on('willInsertElement', function() {
    this.set('graph.labelBar', this);
  }),

  labels: function() {
    var graphics = this.get('graph.graphics');
    var graphicLabels = graphics.filter(function(graphic) {
      return graphic.hasLabel;
    }).sort(function(a, b) {
      var y1 = Math.floor(Ember.get(a, 'labelY'));
      var y2 = Math.floor(Ember.get(b, 'labelY'));
      return y1 - y2;
    }).map(function(label) {
      var y = Number(Ember.get(label, 'labelY'));
      var labelText = Ember.get(label, 'labelText');
      return {
        x: 5, // should be configurable for padding
        y: y,
        text: labelText,
        labelClass: Ember.get(label, 'class'),
        evalClass: 'label ' + labelText.replace(' ', ''),
        evalSelector: '.label.' + labelText.replace(' ', ''),
        background: null
      }
    });

    Ember.run.scheduleOnce('afterRender', this, function() {
      this._addBackgroundForLabels();
    }.bind(this));

    return graphicLabels;
  }.property('graph.graphics.@each'),

  _addBackgroundForLabels: function() {
    var self = this;
    var labels = self.get('labels');
    var lastValue = null;

    var labelsWithBackgrounds = labels.map(function(label, index, array) {
      var width = $(label.evalSelector).outerWidth() + 10 //config;
      var height = $(label.evalSelector).outerHeight() + 10 //config;
      var y = Ember.get(label, 'y');

      if (array[index - 1]) {
        var y1 = y;
        var y2 = Ember.get(array[index - 1], 'y');
        var yDistance = Math.round(y1 - (lastValue || y2));
        var shouldAdjust = yDistance < 0 || yDistance <= height;
        if(shouldAdjust) {
          y = (lastValue || y2) + height //5 pixels of padding;
          lastValue = y;
        }
      }

      return {
        x: label.x, // should be configurable for padding
        y: y,
        text: label.text,
        labelClass: label.labelClass,
        evalClass: label.evalClass,
        evalSelector: label.evalSelector,
        background: {
          x: 5,
          y: y - (height / 2),
          width: width,
          height: height
        }
      }
    });

    self.set('labels', labelsWithBackgrounds);
  }
});
