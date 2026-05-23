window.isg_005_zappel_fx = {
  process: function(type, signal, state) {
    // "VST-Transformation" des Signals
    return { x: signal.x + Math.random(), y: signal.y + Math.random() };
  }
};
