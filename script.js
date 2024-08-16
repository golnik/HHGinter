var firsttime;
var traceCounter = 0; // Counter for the number of traces
var ionizationTimes = [];  // Array to store ionization times
var colors = {}; // Object to store colors for each trace
var hiddenTraces = []; // Array to track hidden traces
var skipAddingTraces = false;  // Flag to control whether to skip adding traces

var global_margin = {
  l: 55,
  r: 15,
  b: 55,
  t: 25,
  pad: 10
}

var global_font = {
  family: '"Open Sans", verdana, arial, sans-serif',
  size: 10,
  color: '#444'
}

var presetColors = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", 
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

var Laserlayout = {
  //title: "Laser Electric Field vs Phase",
  xaxis: {
    title: 'Phase',
    range: [0, 3 * Math.PI]
  },
  yaxis: {
    title: 'Electric Field',
    range: [-1.1, 1.1]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

var Potentiallayout = {
  //title: "Potential Energy vs Distance",
  xaxis: {
    title: 'Distance',
    range: [-2.5, 2.5],
  },
  yaxis: {
    title: 'Energy',
    range: [-30, 25]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

var Displayout = {
  //title: "Displacement vs Phase",
  xaxis: {
    title: 'Phase',
    range: [0, 3 * Math.PI]
  },
  yaxis: {
    title: 'Displacement',
    range: [-3, 3]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
}

var Vellayout = {
  //title: "Velocity vs Phase",
  xaxis: {
    title: 'Phase',
    range: [0, 3 * Math.PI]
  },
  yaxis: {
    title: 'Velocity',
    range: [-3, 3]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
}

var Phase1layout = {
  //title: "Phase Portrait (Velocity vs Displacement)",
  xaxis: {
    title: 'Displacement',
    range: [-2.5, 2.5]
  },
  yaxis: {
    title: 'Velocity',
    range: [-3.5, 3.5]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

var Phase2layout = {
  //title: "Phase Portrait (Kinetic Energy vs Displacement)",
  xaxis: {
    title: 'Displacement',
    range: [-2.5, 2.5]
  },
  yaxis: {
    title: 'Kinetic Energy',
    range: [-3.5, 3.5]
  },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

// Create the layout for the kinetic energy plot
const energyLayout = {
  //title: 'Kinetic Energy at Recombination vs (Left) Ionization Phase and (Right) Recombination Phase',
  xaxis: { title: 'Phase (θ) mod π', range: [0, 2 * Math.PI] },
  yaxis: { title: 'Recombination KE', range: [0, 3.5] },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

const recombinationLayout = {
  //title: 'Recombination Phase as a Function of Ionization Phase',
  xaxis: { title: 'Ionization Phase (θ\u1D62) mod π', range: [0, 0.5 * Math.PI] },
  yaxis: { title: 'Recombination Phase (θ\u1D63)', range: [0.5 * Math.PI, 2 * Math.PI] },
  showlegend: false,
  font: global_font,
  margin: global_margin
};

function getColor(index) {
  return presetColors[index % presetColors.length];
}

let singleClick = false;
let lastClickedIndex = null;

function handleLegendClick(event) {
    const index = parseInt(event.currentTarget.dataset.index); // Get the index from the clicked legend item
    const traceLabel = `Trace ${index}`;
    const traceLabelRegex = new RegExp(`^${traceLabel}\\s`);
    const plots = ['displacement', 'velocity', 'phase1', 'phase2', 'energy', 'recom-ion'];
    let currentVisibility;

    // Check if the same trace was clicked again to reset visibility
    if (singleClick && lastClickedIndex === index) {
        singleClick = false;
        lastClickedIndex = null;

        // Show all traces
        plots.forEach(plotId => {
            const plotElement = document.getElementById(plotId);
            if (plotElement && plotElement.data) {
                //console.log(plotElement)
                //console.log(plotElement.data)
                const traceIndices = plotElement.data.map((trace, i) => i);
                //console.log(traceIndices)
                const visibilities = traceIndices.map(() => true);
                //console.log(visibilities)
                Plotly.restyle(plotElement, { visible: true, opacity: 1 }, traceIndices);
            }
        });

        // Reset legend styles to fully opaque
        document.querySelectorAll('.legendItem').forEach(item => {
            item.style.opacity = '1';
        });
    } else {
        singleClick = true;
        lastClickedIndex = index;

        // Hide all traces except the selected one
        plots.forEach(plotId => {
            const plotElement = document.getElementById(plotId);
            if (plotElement && plotElement.data) {
                plotElement.data.forEach((trace, i) => {
                    
                  //console.log(trace.name)
                  //console.log(i)

                    if ((trace.name && traceLabelRegex.test(trace.name)) || (!trace.name.includes('Trace'))) {
                        currentVisibility = trace.visible;
                        Plotly.restyle(plotElement, { visible: true, opacity: 1 }, [i]);
                    } else if ((trace.name !== "Electron" && trace.name !== "Time")) {
                        // Make sure electron and time bar are not hidden
                        //console.log(plotId)
                        //console.log(trace.name)
                        //console.log(traceLabelRegex)
                        Plotly.restyle(plotElement, { visible: true, opacity: 0.4 }, [i]);
                        
                        if (trace.name.includes('Energy') || (trace.name.includes('Recombination'))) {
                          Plotly.restyle(plotElement, { visible: true, opacity: 0.2 }, [i]);
                        }
                    }
                });
            }
        });

        // Set legend styles
        document.querySelectorAll('.legendItem').forEach(item => {
            if (item.dataset.index == index) {
                item.style.opacity = '1'; // Active state
            } else {
                item.style.opacity = '0.5'; // Inactive state
            }
        });

        // Update data box, timeline, and plots for the selected trace
        skipAddingTraces = true; // Set the flag to skip adding new traces
        ionize(ionizationTimes[index], 1.0);
        skipAddingTraces = false; // Reset the flag
    }
}

function updateLegend() {
    var legendContainer = document.getElementById('legendContainer');
    legendContainer.innerHTML = '<p align="center"></p>';
    const w = 1.0; // Number(document.getElementById("w_text").value);

    for (var i = 0; i < traceCounter; i++) {
        var color = getColor(i);
        var legendItem = document.createElement('div');
        legendItem.className = 'legendItem';
        legendItem.dataset.index = i; // Store the index of the trace

        var colorBox = document.createElement('div');
        colorBox.className = 'legendColorBox';
        colorBox.style.backgroundColor = color;

        var legendText = document.createElement('div');
        legendText.textContent = "Ionization Phase: " + (w * ionizationTimes[i]);
        //console.log(ionizationTimes)

        legendItem.appendChild(colorBox);
        legendItem.appendChild(legendText);
        legendContainer.appendChild(legendItem);

        // Add click event listener
        legendItem.addEventListener('click', handleLegendClick);
    }
}

function graph(t, w) {
  // graphs potential energy and laser electric field
  // define w and t if undefined 
  if (t == undefined || w == undefined) {
    w = 1;
    t = 0;
  }

  // equations
  let exp = "-1 * Math.abs((.5/x)) +  (-10) * x * Math.cos(w * t)";
  let laser_pot = "(-10) * x * Math.cos(w * t)";
  let laser = "Math.cos(w * x)";

  // get ionization and recombination time
  const ionizet = Number(document.getElementById("ionization_time").textContent.slice(17));
  const recomt = Number(document.getElementById("recombination_time").textContent.slice(20));

  // Generate potential values
  const xValues = [];
  const yValues = [];

  // Generate laser potential values
  const ylaserpot = [];

  // Generate laser Field values
  const cosXValues = [];
  const cosYValues = [];
  const tValues = [];

  // values for electron
  var xElectron = [];
  var yElectron = [];

  // update slider and text inputs
  document.getElementById("t_text").value = t;
  document.getElementById("t_slider").value = t;

  // create left + right sides of graph
  for (let x = -3; x <= 0; x += .001) {
    xValues.push(x);
    yValues.push(eval(exp));
    tValues.push(t);

    ylaserpot.push(eval(laser_pot));
  }

  for (let x = 0; x <= 3 * Math.PI; x += .001) {
    xValues.push(x);
    yValues.push(eval(exp));

    cosXValues.push(x);
    cosYValues.push(eval(laser));
    tValues.push(t);

    ylaserpot.push(eval(laser_pot));
  }

  // electron movement
  var ionization_energy = {
    "He": -24.59,
    "Ne": -21.57,
    "Ar": -15.76,
  };

  if (t < ionizet || isNaN(ionizet) || t > recomt) {
    // position of electron in atom 
    xElectron = [0];
    yElectron = [ionization_energy["He"]];
  } else if (t == ionizet) {
    xElectron = [0];
    yElectron = [0];
  } else {
    disp = displacement(t, w)
    position = disp;
    xElectron = [position];
    yElectron = [(-10) * position * Math.cos(w * t)];
  }

  const timebar = { x: tValues, y: xValues, mode: "lines", line: {color: "rgb(0,0,0)"}, name: "Time" };

  // Display using Plotly
  var PotentialData = [
    { x: xValues, y: yValues, mode: "lines", name: "Coulomb Potential" },
    { x: xElectron, y: yElectron, mode: "markers", marker: { color: 'black', size: 10 }, type: "scatter", name: "Electron" },
    { x: xValues, y: ylaserpot, mode: "lines", line: { dash: "dot", color: "rgb(87, 88, 87)" }, name: "Laser Potential" }
  ];

  var LaserData = [
    { x: cosXValues, y: cosYValues, mode: "lines", name: "Laser Field" },
    timebar
  ];

  // placeholder values for electron
  var electronDisplacementX;
  var electronDisplacementYValue;
  var electronVelocityYValue;
  var electronEnergyYValue;

  if (t > recomt) {
    electronDisplacementX = recomt;
    electronDisplacementYValue = displacement(recomt, w);
    electronVelocityYValue = velocity(recomt, w);
    electronEnergyYValue = energy(recomt, w);

  } else if (t < ionizet) {
    electronDisplacementYValue = 0;
    electronVelocityYValue = 0;
    electronEnergyYValue = 0;
    electronDisplacementX = t;
  } else {
    electronDisplacementX = t;
    electronDisplacementYValue = displacement(t, w);
    electronVelocityYValue = velocity(t, w);
    electronEnergyYValue = energy(t, w);
  };

  const electronDisplacement = [electronDisplacementX];
  const electronDisplacementYArr = [electronDisplacementYValue];
  const electronVelocityYArr = [electronVelocityYValue];
  const electronPhase1X = [electronDisplacementYValue];
  const electronPhase1Y = [electronVelocityYValue];
  const electronPhase2X = [electronDisplacementYValue];
  const electronPhase2Y = [electronEnergyYValue];

  var DispData = [
    timebar,
    { x: electronDisplacement, y: electronDisplacementYArr, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];

  var VelData = [
    timebar,
    { x: electronDisplacement, y: electronVelocityYArr, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];

  var Phase1Data = [
    { x: electronPhase1X, y: electronPhase1Y, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];

  var Phase2Data = [
    { x: electronPhase2X, y: electronPhase2Y, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];


  if (firsttime != false) {
    Plotly.newPlot("field", LaserData, Laserlayout, { displayModeBar: false, responsive: true });
    Plotly.newPlot("potential", PotentialData, Potentiallayout, { displayModeBar: false, responsive: true });

    Plotly.newPlot("displacement", DispData, Displayout, { displayModeBar: false, responsive: true });
    Plotly.newPlot("velocity", VelData, Vellayout, { displayModeBar: false, responsive: true });

    Plotly.newPlot("phase1", Phase1Data, Phase1layout, { displayModeBar: false, responsive: true });
    Plotly.newPlot("phase2", Phase2Data, Phase2layout, { displayModeBar: false, responsive: true });

    // Initialize graph_supp plots as empty
    var emptyData = [{
      x: [],
      y: [],
      mode: 'lines',
      type: 'scatter'
    }];

    var emptyLayoutEnergy = {
      //title: 'Kinetic Energy at Recombination vs (Left) Ionization Phase and (Right) Recombination Phase',
      xaxis: { title: 'Phase (θ) mod π', range: [0, 2 * Math.PI] },
      yaxis: { title: 'Recombination KE', range: [0, 3.5] },
      showlegend: false,
      font: global_font,
      margin: global_margin
    };

    var emptyLayoutRecombination = {
      //title: 'Recombination Phase as a Function of Ionization Phase',
      xaxis: { title: 'Ionization Phase (θ\u1D62) mod π', range: [0, 0.5 * Math.PI] },
      yaxis: { title: 'Recombination Phase (θ\u1D63)', range: [0.5 * Math.PI, 2 * Math.PI] },
      showlegend: false,
      font: global_font,
      margin: global_margin
    };

    Plotly.newPlot('energy', emptyData, emptyLayoutEnergy, { displayModeBar: false, responsive: true });
    Plotly.newPlot('recom-ion', emptyData, emptyLayoutRecombination, { displayModeBar: false, responsive: true });

  } else {
    Plotly.react("field", LaserData, Laserlayout, { displayModeBar: false, responsive: true });
    Plotly.react("potential", PotentialData, Potentiallayout, { displayModeBar: false, responsive: true });

    Plotly.restyle("displacement", { x: [tValues], y: [xValues] }, [0]);
    Plotly.restyle("displacement", { x: [electronDisplacement], y: [electronDisplacementYArr] }, [1]);

    Plotly.restyle("velocity", { x: [tValues], y: [xValues] }, [0]);
    Plotly.restyle("velocity", { x: [electronDisplacement], y: [electronVelocityYArr] }, [1]);

    Plotly.restyle("phase1", { x: [electronPhase1X], y: [electronPhase1Y] }, [0]);
    Plotly.restyle("phase2", { x: [electronPhase2X], y: [electronPhase2Y] }, [0]);
  }
  firsttime = false;
}

function timeline(t0, t) {
  var before = {
    type: "bar",
    x: [t0],
    y: [""],
    name: "before ionization",
    orientation: 'h',
    marker: {
      color: 'rgba(255,255,0,1)',
      line: {
        color: 'rgb(8, 48, 107)',
        width: 1
      }
    },
  };

  var during = {
    type: "bar",
    x: [(t - t0)],
    y: [""],
    name: "after ionization",
    orientation: 'h',
    marker: {
      color: 'rgba(75,255,75,1)',
      line: {
        color: 'rgb(8, 48, 107)',
        width: 1
      }
    },
  };

  var after = {
    type: "bar",
    x: [(3 * Math.PI - t)],
    y: [""],
    name: "after recombination",
    orientation: 'h',
    marker: {
      color: 'rgba(255,50,0,1)',
      line: {
        color: 'rgb(8, 48, 107)',
        width: 1
      }
    },
  };

  var data = [before, during, after];

  var layout = {
    barmode: "stack",
    xaxis: {
      showticklabels: false,
      range: [0, 3 * Math.PI + 0.001], // Ensure the x-axis range covers the entire plot
      fixedrange: true, // Prevent zooming
      automargin: true, // Automatically adjust margins
      zeroline: false, // Remove the zero line
      showgrid: false, // Remove the grid lines
      anchor: 'free', // Free up the positioning
      position: 0 // Center the plot horizontally
    },
    yaxis: { showticklabels: false },
    showlegend: true,
    legend: { "orientation": "h", "traceorder": "normal" },
    margin: { b: 0, l: 0, r: 0, t: 0, pad: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    //height: 50,
    autosize: true,
  };

  Plotly.newPlot('timegraph', data, layout, { displayModeBar: false, responsive: true });
}

function linspace(start, end, num) {
  const arr = [];
  const step = (end - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    arr.push(start + (step * i));
  }
  return arr;
};

function displacement(t, w) {
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(17)) * w;
  return -1 * (Math.cos(theta) - Math.cos(theta_0) + (theta * Math.sin(theta_0)) - (theta_0 * Math.sin(theta_0)));
}

function displacement_0(theta, theta_i) {
  return theta.map(theta => (Math.cos(theta) - Math.cos(theta_i) + (theta * Math.sin(theta_i)) - (theta_i * Math.sin(theta_i))));
}

function velocity(t, w) {
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(17)) * w;
  return -1 * (Math.sin(theta_0) - Math.sin(theta));
}

function max_velocity(theta, theta_i) {
  const velocity_array = theta.map(theta => (Math.sin(theta_i) - Math.sin(theta)));
  return velocity_array[velocity_array.length - 1]; // Return the final value in velocity_array
}

function energy(t, w) {
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(17));
  return (2 * (Math.sin(theta_0) - Math.sin(theta)) ** 2);
}

function ionize(t0, w) {
  if (t0 === null) {
    // Handle case when t0 is null (cleargraphs calls this with null)
    graph(0, w);
    return;
  }

  var theta_0 = t0 * w;
  var rem = theta_0 % Math.PI;
  var quo = theta_0 / Math.PI;

  //console.log(rem)

  const theta = linspace(0, 2 * Math.PI, 1000);
  const theta_i_array = linspace(0, Math.PI / 2, 1000);
  const theta_r_dict = {};
  const max_velocity_dict = {}
  const energy_dict = {};

  // create theta_r and displacement dictionaries
  theta_i_array.forEach(theta_i => {
    const x = displacement_0(theta, theta_i);
    const filtered_theta = theta.filter((t, i) => t >= theta_i && x[i] <= 0);
    const final_theta = filtered_theta[filtered_theta.length - 1];
    theta_r_dict[theta_i] = final_theta;
    max_velocity_dict[theta_i] = max_velocity(filtered_theta, theta_i);
    energy_dict[theta_i] = 2 * Math.pow(max_velocity_dict[theta_i], 2);
  });

  // finds smallest difference between user input and theta_i values
  smallestDiff = Math.abs(rem - theta_i_array[0]);
  closest = 0;

  for (i = 1; i < theta_i_array.length; i++) {
    currentDiff = Math.abs(rem - theta_i_array[i]);
    if (currentDiff < smallestDiff) {
      smallestDiff = currentDiff;
      closest = i;
    }
  }
  
  //console.log(theta_i_array[closest])

  if (theta_0 > 2 * Math.PI) {
    warning.textContent = "Warning: Please only ionize between 0 and 2\u03C0!";
    return;
  } else {
    if (rem >= Math.PI / 2) {
      // no recombination
      recombination.textContent = "Recombination: \u274c";
      recombination_time.textContent = "Recombination Phase: N/A";
      document.getElementById("trajectory").textContent = "Trajectory: N/A";
      timeline(t0, (3 * Math.PI));
    } else {
      // update information with recombination 
      recombination.textContent = "Recombination: \u2705";
      if (theta_0 < Math.PI) {
        recombination_time.textContent = "Recombination Phase: " + (theta_r_dict[theta_i_array[closest]] / w).toFixed(3);
      } else {
        recombination_time.textContent = "Recombination Phase: " + ((Math.PI + theta_r_dict[theta_i_array[closest]] / w)).toFixed(3);
      }
      if (rem < Math.PI / 10) {
        trajectory.textContent = "Trajectory: Long";
      } else {
        trajectory.textContent = "Trajectory: Short";
      }
      if (quo < 1.0) {
        timeline(t0, (theta_r_dict[theta_i_array[closest]] / w));
      }
      else{
        timeline(t0, Math.PI + (theta_r_dict[theta_i_array[closest]] / w));
      }
    }
    if (t0 == null) {
      ionization_time.textContent = "Ionization Phase: N/A";
    } else {
      time = parseFloat(t0);
      ionization_time.textContent = "Ionization Phase: " + time.toFixed(3);
      if (!skipAddingTraces) {
        ionizationTimes.push(t0);
        new_trace(t0, w);
        document.getElementById('legendContainer').style.display = 'block';
      }
    }
    graph(t0, w);
    if (!skipAddingTraces) {
      graph_supp(theta_r_dict, energy_dict);
    }
  }
}


function new_trace(t, w){
  //console.log(traceCounter)
  const recomt = Number(document.getElementById("recombination_time").textContent.slice(20));
  const traceColor = getColor(traceCounter);
  const traceName = `Trace ${traceCounter} (t:${t})`;

  // Generate displacement values
  const disp_yValues = [];
  const disp_xValues = [];
  
  // Generate velocity values
  const vel_xValues = [];
  const vel_yValues = [];
  
  // Generate energy values
  const nrg_xValues = [];
  const nrg_yValues = [];

  for (let x = 0; x <= 3*(Math.PI)/w; x += .001){
    if (x <= (t*w)|| x>= recomt){
      disp_yValues.push(0);
      vel_yValues.push(0);
      nrg_yValues.push(0);
    } else{
      disp_yValues.push(displacement(x, w));
      vel_yValues.push(velocity(x, w));
      nrg_yValues.push(2 * Math.pow(velocity(x,w), 2));
    } 
    
    disp_xValues.push(x);
    vel_xValues.push(x);
    nrg_xValues.push(x);
  };

  Plotly.addTraces("displacement", { x: disp_xValues, y: disp_yValues, name: traceName, line: { color: traceColor } });
  Plotly.addTraces("velocity", { x: vel_xValues, y: vel_yValues, name: traceName, line: { color: traceColor } });
  Plotly.addTraces("phase1", { x: disp_yValues, y: vel_yValues, name: traceName, line: { color: traceColor } });
  Plotly.addTraces("phase2", { x: disp_yValues, y: nrg_yValues, name: traceName, line: { color: traceColor } });
}


function graph_supp(theta_r_dict, energy_dict) {
  // Extract the data from the dictionaries
  const theta_i_keys = Object.keys(theta_r_dict).map(Number);
  const theta_r_values = Object.values(theta_r_dict).map(Number);
  const energy_values = Object.values(energy_dict);
 
  // Create the data for the kinetic energy plot
  const energyDataThetaI = {
    x: theta_i_keys,
    y: energy_values,
    mode: 'lines', line: {color: "rgb(0,0,255)"},
    type: 'scatter',
    name: `Kinetic Energy vs Ionization Phase`,
  };
 
  const energyDataThetaR = {
    x: theta_r_values,
    y: energy_values,
    mode: 'lines', line: {color: "rgb(255,0,0)"},
    type: 'scatter',
    name: `Kinetic Energy vs Recombination Phase`,
  };

  // Plot the kinetic energy data if not already plotted
  if (traceCounter == 0) {
    Plotly.newPlot('energy', [energyDataThetaI, energyDataThetaR], energyLayout, { displayModeBar: false, responsive: true });
  }

  const recombinationData = [
    {
      x: theta_i_keys,
      y: theta_r_values,
      mode: 'lines', line: {color: "rgb(0,0,0)"},
      type: 'scatter',
      name: `Recombination Phase vs Ionization Phase`
    }
  ];

  const recombinationLayout = {
    //title: 'Recombination Phase as a Function of Ionization Phase',
    xaxis: { title: 'Ionization Phase (θ\u1D62) mod π', range: [0, 0.5 * Math.PI] },
    yaxis: { title: 'Recombination Phase (θ\u1D63)', range: [0.5 * Math.PI, 2 * Math.PI] },
    showlegend: false,
    font: global_font,
    margin: global_margin
  };

  if (traceCounter == 0) {
    Plotly.newPlot('recom-ion', recombinationData, recombinationLayout, { displayModeBar: false, responsive: true });
  }

  const w = 1.0;

  var ionizationTime = ionizationTimes[ionizationTimes.length - 1]; 
  const theta_i_array = linspace(0, Math.PI / 2, 1000);
  smallestDiff = Math.abs((w * ionizationTime) - theta_i_array[0]);
  closest = 0;
  
  for (i=1; i < theta_i_array.length; i++){
    if (ionizationTime <= Math.PI) {
      currentDiff = Math.abs((w * ionizationTime) - theta_i_array[i]);
      if (currentDiff < smallestDiff) {
        smallestDiff = currentDiff;
        closest = i;
      }
    }
    else {
      ionizationTime = ionizationTime - Math.PI;
      currentDiff = Math.abs((w * ionizationTime) - theta_i_array[i]);
      if (currentDiff < smallestDiff) {
        smallestDiff = currentDiff;
        closest = i;
      }
    }
  }

  const traceColor = getColor(traceCounter); // Get the latest color

  const verticalBarEnergyIon = {
    x: [theta_i_array[closest], theta_i_array[closest]],
    y: [0, energy_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Trace ${traceCounter} : Energy Vertical Rec`
  };

  const verticalBarEnergyRec = {
    x: [theta_r_dict[theta_i_array[closest]], theta_r_dict[theta_i_array[closest]]],
    y: [0, energy_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Trace ${traceCounter} : Energy Vertical Ion`
  };

  const horizontalBarEnergy = {
    x: [theta_i_array[closest], theta_r_dict[theta_i_array[closest]]],
    y: [energy_dict[theta_i_array[closest]], energy_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    line: { dash: "dot", color: traceColor },
    name: `Trace ${traceCounter} : Energy Horizontal`
  };


  const verticalBarRecombination = {
    x: [theta_i_array[closest], theta_i_array[closest]],
    y: [0.5 * Math.PI, theta_r_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Trace ${traceCounter} : Recombination Vertical`
  };

  const horizontalBarRecombination = {
    x: [0, theta_i_array[closest]],
    y: [theta_r_dict[theta_i_array[closest]], theta_r_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Trace ${traceCounter} : Recombination Horizontal`
  };

  Plotly.addTraces('energy', [verticalBarEnergyIon, verticalBarEnergyRec, horizontalBarEnergy]);
  Plotly.addTraces('recom-ion', [verticalBarRecombination, horizontalBarRecombination]);

  traceCounter++;
  updateLegend();
}

function cleargraphs() {
  console.clear();
  firsttime = true;
  traceCounter = -1;
  colors = {};
  ionizationTimes = [];
  Plotly.purge("displacement");
  Plotly.purge("velocity");
  Plotly.purge("phase1");
  Plotly.purge("phase2");
  Plotly.purge("energy");
  Plotly.purge("recom-ion");
  Plotly.purge("timegraph");

  var legendContainer = document.getElementById('legendContainer');
  legendContainer.innerHTML = '<p align="center"></p>';

  document.getElementById("ionization_time").textContent = "";
  document.getElementById("recombination").textContent = "";
  document.getElementById("recombination_time").textContent = "";
  document.getElementById("trajectory").textContent = "";
  document.getElementById("warning").textContent = "";

  const w = 1.0;
  ionize(null, w);

  traceCounter = 0;
};

function multi() {
    // Add loading class to body
    document.body.classList.add('loading');

    cleargraphs();

    var w = 1.0;
    var x = 0;
    var step = 0.1 * Math.PI;

    function runLoop() {
        if (x <= (Math.PI) / w) {
            ionize(x, w);
            x += step;
            setTimeout(runLoop, 0); // Schedule the next iteration
        } else {
            // Remove the loading class from body after loop completes
            document.body.classList.remove('loading');
        }
    }

    // Start the loop
    runLoop();
}
