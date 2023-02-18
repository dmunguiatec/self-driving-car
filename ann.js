class NeuralNetwork {
    constructor(neuronCounts) {
        this.layers = [];

        for (let i = 0; i < neuronCounts.length - 1; i++)
            this.layers.push(new Layer(neuronCounts[i], neuronCounts[i + 1]));
    }

    static feedForward(inputs, network) {
        let outputs = Layer.feedForward(inputs, network.layers[0]);

        for (let i = 1; i < network.layers.length; i++)
            outputs = Layer.feedForward(outputs, network.layers[i]);

        return outputs;
    }

    static mutate(network, percentage=1) {
        network.layers.forEach(layer => {
            for (let i = 0; i < layer.biases.length; i++) {
                layer.biases[i] = linearInterpolation(
                    layer.biases[i],
                    Math.random() * 2 - 1,
                    percentage
                );
            }

            for (let i = 0; i < layer.weights.length; i++) {
                for (let j = 0; j < layer.weights[i].length; j++) {
                    layer.weights[i][j] = linearInterpolation(
                        layer.weights[i][j],
                        Math.random() * 2 - 1,
                        percentage
                    );
                }
            }
        });
    }
}

class Layer {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = []
        for (let i = 0; i < inputCount; i++) {
            this.weights.push(new Array(outputCount));
        }

        Layer.#randomize(this);
    }

    static #randomize(layer) {
        for (let i = 0; i < layer.inputs.length; i++) {
            for (let j = 0; j < layer.outputs.length; j++) {
                layer.weights[i][j] = Math.random() * 2 - 1; // range [-1, 1]
            }
        }

        for (let i = 0; i < layer.biases.length; i++) {
            layer.biases[i] = Math.random() * 2 - 1; // [-1, 1]
        }
    }

    static feedForward(inputs, layer) {
        for (let i = 0; i < layer.inputs.length; i++)
            layer.inputs[i] = inputs[i];

        for (let i = 0; i < layer.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < layer.inputs.length; j++)
                sum += layer.inputs[j] * layer.weights[j][i];

            layer.outputs[i] = (sum > layer.biases[i]) ? 1 : 0 ;
        }

        return layer.outputs;
    }
}