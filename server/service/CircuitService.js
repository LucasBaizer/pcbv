'use strict';


/**
 * Deletes a circuit
 *
 * circuitId String GUID of the circuit
 * no response value expected for this operation
 **/
exports.circuitCircuitIdDELETE = function(circuitId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Creates basic information and the image for a new circuit
 *
 * returns Circuit
 **/
exports.createCircuit = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Creates a new circuit category
 *
 * circuitId String GUID of the circuit
 * returns Category
 **/
exports.createCircuitCategory = function(circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Creates basic information and image of a particular subcircuit in a circuit
 *
 * body SubCircuit Data to create for the subcircuit
 * circuitId String GUID of the circuit
 * returns SubCircuit
 **/
exports.createSubCircuit = function(body,circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Deletes a particular category of a circuit
 *
 * circuitId String GUID of the circuit
 * categoryId Integer ID of the category
 * no response value expected for this operation
 **/
exports.deleteCircuitCategory = function(circuitId,categoryId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Deletes a root component from the circuit
 *
 * circuitId String GUID of the circuit
 * componentId Integer ID of the component
 * no response value expected for this operation
 **/
exports.deleteCircuitComponent = function(circuitId,componentId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Deletes a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * no response value expected for this operation
 **/
exports.deleteSubCircuit = function(circuitId,subCircuitId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Deletes a component from a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * componentId Integer ID of the component
 * no response value expected for this operation
 **/
exports.deleteSubCircuitComponent = function(circuitId,subCircuitId,componentId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Gets basic information and the image of a circuit
 *
 * circuitId String GUID of the circuit
 * returns Circuit
 **/
exports.getCircuit = function(circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets categories of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getCircuitCategories = function(circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets root components of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getCircuitComponents = function(circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets components of a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * returns List
 **/
exports.getSubCircuitComponents = function(circuitId,subCircuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets basic information and the image of all subcircuits of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getSubCircuits = function(circuitId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

