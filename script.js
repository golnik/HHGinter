var firsttime;
var traceCounter = 0; // Counter for the number of traces
var colors = {}; // Object to store colors for each trace
var ionizationTimes = []; // Array to store ionization times

var global_margin = {
  l: 55,
  r: 15,
  b: 45,
  t: 45,
  pad: 10
}

var global_font = {
  family: '"Open Sans", verdana, arial, sans-serif',
  size: 10,
  color: '#444'
}

// Define a list of default colors (based on Plotly's default color palette)
var presetColors = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", 
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

function getColor(index) {
  return presetColors[index % presetColors.length];
}

function graph(t, w){
//graphs potential energy and laser electric field
  // define w and t if undefined 
  if (t == undefined || w == undefined){
    w = 1;
    t = 0;
  }

  // equations
  let exp = "-1 * Math.abs((.5/x)) +  (-5) * x * Math.cos(w * t)";
  let laser_pot = "(-5) * x * Math.cos(w * t)";
  let laser  = "Math.cos(w * x)";

  //get ionization and recombination time
  const ionizet = Number(document.getElementById("ionization_time").textContent.slice(16));
  const recomt = Number(document.getElementById("recombination_time").textContent.slice(19));

  // Generate potential values
  const xValues = [];
  const yValues = []; 

  // Generate laser potential values
  const ylaserpot = [];

  //Generate laser Field values
  const cosXValues = [];
  const cosYValues = [];
  const tValues = [];

  // values for electron
  var xElectron = [];
  var yElectron = [];

  // update slider and text inputs
  document.getElementById("t_text").value = t;
  document.getElementById("t_slider").value = t;
  //document.getElementById("w_text").value = w;

  //t_label.textContent = "Phase: " + t;
  //w_label.textContent = "Frequency (\u03c9): " + w;

  // create left + right sides of graph
  for (let x = -3; x <= 0; x += .001){
    xValues.push(x);
    yValues.push(eval(exp));
    tValues.push(t);

    ylaserpot.push(eval(laser_pot));
  }
  
  for (let x = 0; x <= 3 * Math.PI; x += .001){
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

  if (t < ionizet || ionizet == NaN || t > recomt){
    // position of electron in atom 
    xElectron = [0];
    yElectron = [ionization_energy["He"]]; //document.querySelector("input[name='element']:checked").value]];
    //console.log(yElectron);
  } else if (t == ionizet){
    xElectron = [0];
    yElectron = [0];
  } else{
      disp = displacement(t, w)
      position = disp;
      xElectron = [position];
      yElectron = [(-5) * position * Math.cos(w * t)];
  }

  const timebar = {x: tValues, y: xValues, mode: "lines", name:"Time"};

  // Display using Plotly
  var PotentialData = [
    {x:xValues, y:yValues, mode:"lines", name:"Coulomb Potential"}, 
    {x: xElectron, y: yElectron, mode: "markers",marker: { color: 'black', size: 10 }, type:"scatter", name:"Electron"},
    {x: xValues, y: ylaserpot, mode: "lines", line: {dash: "dot", color: "rgb(87, 88, 87)"}, name:"Laser Potential"}];

  var LaserData = [
    {x: cosXValues, y: cosYValues, mode:"lines", name:"Laser Field" }, 
    timebar];

  var Potentiallayout = {
    title: "Potential Energy vs Distance",
    xaxis: {
      title: 'Distance', //(\u212B)',
      range: [-2.5, 2.5],},
    yaxis: {
      title: 'Energy', //(eV)', //check units
      range: [-30, 25]},
    showlegend: false,
    font: global_font,
    margin: global_margin
  };

  var Laserlayout = {
    title: "Laser Electric Field vs Phase",
    xaxis: {
      title: 'Phase',
      range: [0, 3 * Math.PI]},
    yaxis: {
      title: 'Electric Field',
      range: [-1.1, 1.1]},
    showlegend: false,
    font: global_font,
    margin: global_margin
  }; 

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
 
  } else if (t< ionizet){
    electronDisplacementYValue = 0;
    electronVelocityYValue = 0;
    electronEnergyYValue = 0;
    electronDisplacementX = 0;
    } else{
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


  // Electron positions and time Data
  const ElectronColor = { color: 'black', size: 10 };
  
  var DispData = [
    timebar,
    { x:electronDisplacement, y: electronDisplacementYArr, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];

  var VelData = [
    timebar,
    { x: electronDisplacement, y: electronVelocityYArr, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }];

  var Phase1Data = [
    { x: electronPhase1X, y: electronPhase1Y, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } } 
  ];

  
  var Phase2Data = [
    { x: electronPhase2X, y: electronPhase2Y, mode: "markers", type: "scatter", name: "Electron", marker: { color: 'black', size: 10 } }
  ];
 
  // graph layouts
  var Displayout = {
    title: "Displacement vs Phase",
    xaxis: {
      title: 'Phase',
      range: [0, 3 * Math.PI]},
    yaxis: {
      title: 'Displacement', //(\u212B)',
      range: [-3, 3]},
    showlegend: false,
    font: global_font,
    margin: global_margin
  }

    var Vellayout = {
        title: "Velocity vs Phase",
        xaxis: {
          title: 'Phase',
          range: [0, 3 * Math.PI]},
        yaxis: {
          title: 'Velocity', //(\u212B/s)',
          range: [-3, 3]},
        showlegend: false,
        font: global_font,
        margin: global_margin
    }

    var Phase1layout = {
      title: "Phase Portrait (Velocity vs Displacement)",
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
      title: "Phase Portrait (Kinetic Energy vs Displacement)",
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
  
  if (firsttime != false) {
    Plotly.newPlot("field", LaserData, Laserlayout,{displayModeBar: false, responsive: true});
    Plotly.newPlot("potential", PotentialData, Potentiallayout, {displayModeBar: false, responsive: true});

    Plotly.newPlot("displacement", DispData, Displayout,{displayModeBar: false, responsive: true});
    Plotly.newPlot("velocity", VelData, Vellayout,{displayModeBar: false, responsive: true});

    Plotly.newPlot("phase1", Phase1Data, Phase1layout,{displayModeBar: false, responsive: true});
    Plotly.newPlot("phase2", Phase2Data, Phase2layout,{displayModeBar: false, responsive: true});

     // Initialize graph_supp plots as empty
     var emptyData = [{
      x: [],
      y: [],
      mode: 'lines',
      type: 'scatter'
    }];

    var emptyLayoutEnergy = {
      title: 'Kinetic Energy at Recombination vs (Left) Ionization Phase and (Right) Recombination Phase',
      xaxis: { title: 'Phase (θ)', range: [0, 2 * Math.PI] },
      yaxis: { title: 'Recombination KE', range: [0, 3.5] },
      showlegend: false,
      font: global_font,
      margin: global_margin
    };

    var emptyLayoutRecombination = {
      title: 'Recombination Phase as a Function of Ionization Phase',
      xaxis: { title: 'Ionization Phase (θ\u1D62)', range: [0, 0.5 * Math.PI]},
      yaxis: { title: 'Recombination Phase (θ\u1D63)', range: [0.5 * Math.PI, 2 * Math.PI] },
      showlegend: false,
      font: global_font,
      margin: global_margin
    };

    Plotly.newPlot('energy', emptyData, emptyLayoutEnergy, { displayModeBar: false, responsive: true });
    Plotly.newPlot('recom-ion', emptyData, emptyLayoutRecombination, { displayModeBar: false, responsive: true });

  } else{
    Plotly.react("field",LaserData, Laserlayout,{displayModeBar: false, responsive: true});
    Plotly.react("potential",PotentialData, Potentiallayout, {displayModeBar: false, responsive: true});

    Plotly.restyle("displacement",{ x: [tValues], y: [xValues]}, [0]);
    Plotly.restyle("displacement",{ x: [electronDisplacement], y: [electronDisplacementYArr]}, [1]);

    Plotly.restyle("velocity",{ x: [tValues], y: [xValues]}, [0]);
    Plotly.restyle("velocity",{ x: [electronDisplacement], y: [electronVelocityYArr]}, [1]);

    Plotly.restyle("phase1",{ x: [electronPhase1X], y: [electronPhase1Y]}, [0]);
    Plotly.restyle("phase2",{ x: [electronPhase2X], y: [electronPhase2Y]}, [0]);
  }
  firsttime = false;
}

// create "timeline" that shows before ionization, after ionization, and recombination
function timeline(t0, t){
  var before = {
    type: "bar",
    x: [t0],
    y: [""],
    name: "before ionization",
    orientation: 'h',
    marker: {
      color: 'rgba(255,255,0,1)',
      line: {
        color:'rgb(8, 48, 107)',
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
        color:'rgb(8, 48, 107)',
        width: 1
      }
    },
  };

  var after = {
    type: "bar",
    // 2 * Math.PI is MAX. TIME VALUE. NEEDS TO MATCH
    x: [(3 * Math.PI - t)], 
    y: [""],
    name: "after recombination",
    orientation: 'h',
    marker: {
      color: 'rgba(255,50,0,1)',
      line: {
        color:'rgb(8, 48, 107)',
        width: 1
      }
    },
  };

  var data = [before, during, after];
  var layout = {
    barmode: "stack",
    xaxis: {showticklabels: false},
    showlegend: true,
    legend: {"orientation": "h", "traceorder": "normal"},
    margin: {b: 0, l: 20, r: 0, t: 0, pad: 0},
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  Plotly.newPlot('timegraph', data, layout, {displayModeBar: false, responsive: true});
}

// gets linespacing and displacement for recombination times
function linspace(start, end, num) {
  const arr = [];
  const step = (end - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    arr.push(start + (step * i));
  }
  return arr;
};

// displacement function
function displacement(t, w){
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(16)) * w;
  //console.log( Math.abs((Math.cos(theta) - Math.cos(theta_0) + (theta * Math.sin(theta_0)) - (theta_0 * Math.sin(theta_0)))))
  return -1 * ( Math.cos(theta) - Math.cos(theta_0) + (theta * Math.sin(theta_0)) - (theta_0 * Math.sin(theta_0)));
}

// displacement function for recombination values (ARRAY)
function displacement_0(theta, theta_i){
  return theta.map(theta => (Math.cos(theta) - Math.cos(theta_i) + (theta * Math.sin(theta_i)) - (theta_i * Math.sin(theta_i))));
}

// velocity function
function velocity(t, w) {
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(16)) * w;
  return -1*(Math.sin(theta_0) - Math.sin(theta));
}

function max_velocity(theta, theta_i) {
  const velocity_array = theta.map(theta => (Math.sin(theta_i) - Math.sin(theta)));
  return velocity_array[velocity_array.length - 1]; // Return the final value in velocity_array
 }


// Energy function
function energy(t, w) {
  const theta = t * w;
  const theta_0 = Number(document.getElementById("ionization_time").textContent.slice(16));
  return (2 * (Math.sin(theta_0) - Math.sin(theta)) ** 2);
}

// gets closest recombination time for user ionization time
function ionize(t0, w){
  
  if (t0 === null) {
    // Handle case when t0 is null (cleargraphs calls this with null)
    graph(0, w);
    return;
  }

  var theta_0 = t0 * w;
  var rem = theta_0 % Math.PI;

  const theta = linspace(0, 2 * Math.PI, 1000);
  const theta_i_array = linspace(0, Math.PI / 2, 1000);
  const theta_r_dict = {};
  const max_velocity_dict = {}
  const energy_dict = {};

  // create r_theta and displacement dictionaries
  theta_i_array.forEach(theta_i => {
    const x = displacement_0(theta, theta_i);
    const filtered_theta = theta.filter((t, i) => t >= theta_i && x[i] <= 0);
    const final_theta = filtered_theta[filtered_theta.length - 1];
    theta_r_dict[theta_i] = final_theta;
    max_velocity_dict[theta_i] = max_velocity(filtered_theta, theta_i);
    energy_dict[theta_i] = 2*Math.pow(max_velocity_dict[theta_i], 2);
  });

  // finds smallest difference between user input and theta_i values
  smallestDiff = Math.abs(rem - theta_i_array[0]);
  closest = 0;

  for (i=1; i < theta_i_array.length; i++){
    currentDiff = Math.abs(rem - theta_i_array[i]);
    if (currentDiff < smallestDiff) {
      smallestDiff = currentDiff;
      closest = i;
    }
  }

  if (theta_0 > 2 * Math.PI){
    console.log("Please only ionize between 0 and 2\u03C0")
  } else {
    if (rem > Math.PI / 2) {
      // no recombination
      recombination.textContent = "Recombination: \u274c";
      recombination_time.textContent = "Recombination Time: N/A";
      document.getElementById("trajectory").textContent = "Trajectory: N/A";
      timeline(t0, (3 * Math.PI));
    } else {
      // update information with recombination 
      recombination.textContent = "Recombination: \u2705";
      if (theta_0 < Math.PI){
        recombination_time.textContent = "Recombination Time: " + theta_r_dict[theta_i_array[closest]] / w;
      } else {
        recombination_time.textContent = "Recombination Time: " + (Math.PI + theta_r_dict[theta_i_array[closest]] / w);
      }
      if (rem < Math.PI / 10){
        //console.log(rem);
        trajectory.textContent = "Trajectory: Long";
      } else {
        //console.log(rem);
        trajectory.textContent = "Trajectory: Short";
      }
      timeline(t0, (theta_r_dict[theta_i_array[closest]] / w));
    }
    if(t0 == null){
      ionization_time.textContent = "Ionization Time: N/A";
    } else {
      ionization_time.textContent = "Ionization Time: " + t0;
      ionizationTimes.push(t0);
      new_trace(t0, w);
      document.getElementById('legendContainer').style.display = 'block'; // Show the legend box
    }
  graph(t0, w);
  graph_supp(theta_r_dict, energy_dict)
  }  
}

// creates moving timebar for "smaller" graphs (not laser field/ potential energy)

function new_trace(t, w){

    const recomt = Number(document.getElementById("recombination_time").textContent.slice(19));
    const traceColor = getColor(traceCounter);

    // Generate displacement values"
    const disp_yValues = [];
    const disp_xValues = [];
  
    // Generate velocity values"
    const vel_xValues = [];
    const vel_yValues = [];
  
    // Generate energy values"
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

  Plotly.addTraces("displacement", { x: disp_xValues, y: disp_yValues, name: "t:" + (t), line: { color: traceColor } });
  Plotly.addTraces("velocity", { x: vel_xValues, y: vel_yValues, name: "t:" + (t), line: { color: traceColor } });
  Plotly.addTraces("phase1", { x: disp_yValues, y: vel_yValues, name: "t:" + (t), line: { color: traceColor } });
  Plotly.addTraces("phase2", { x: disp_yValues, y: nrg_yValues, name: "t:" + (t), line: { color: traceColor } });

  traceCounter++;
  updateLegend();
  
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
    mode: 'lines',
    type: 'scatter',
    name: 'Kinetic Energy vs Ionization Time'
  };
 
  const energyDataThetaR = {
    x: theta_r_values,
    y: energy_values,
    mode: 'lines',
    type: 'scatter',
    name: 'Kinetic Energy vs Recombination Time'
  };

  // Create the layout for the kinetic energy plot
  const energyLayout = {
    title: 'Kinetic Energy at Recombination vs (Left) Ionization Phase and (Right) Recombination Phase',
    xaxis: { title: 'Phase (θ)', range: [0, 2 * Math.PI] },
    yaxis: { title: 'Recombination KE', range: [0, 3.5] },
    showlegend: false,
    font: global_font,
    margin: global_margin
  };

  // Plot the kinetic energy data if not already plotted
  if (traceCounter === 1) {
    Plotly.newPlot('energy', [energyDataThetaI, energyDataThetaR], energyLayout, { displayModeBar: false, responsive: true });
  }
 
 // Create the data for the recombination time plot
  const recombinationData = [

  {
    x: theta_i_keys,
    y: theta_r_values,
    mode: 'lines',
    type: 'scatter',
    name: 'Recombination Time'
  }
  ];

  // Create the layout for the recombination time plot
  const recombinationLayout = {
    title: 'Recombination Phase as a Function of Ionization Phase',
    xaxis: { title: 'Ionization Phase (θ\u1D62)', range: [0, 0.5 * Math.PI]},
    yaxis: { title: 'Recombination Phase (θ\u1D63)', range: [0.5 * Math.PI, 2 * Math.PI] },
    showlegend: false,
    font: global_font,
    margin: global_margin
  };

  // Plot the recombination time data if not already plotted
  if (traceCounter === 1) {
    Plotly.newPlot('recom-ion', recombinationData, recombinationLayout, { displayModeBar: false, responsive: true });
  }

  const w = 1.0; //Number(document.getElementById("w_text").value);

  // Add vertical bars for ionization phase
  const ionizationTime = ionizationTimes[ionizationTimes.length - 1]; 
  //console.log(ionizationTime)// Get the latest ionization time
  const theta_i_array = linspace(0, Math.PI / 2, 1000);
  // finds smallest difference between user input and theta_i values
  smallestDiff = Math.abs((w * ionizationTime) - theta_i_array[0]);
  closest = 0;
  
  for (i=1; i < theta_i_array.length; i++){
    currentDiff = Math.abs((w * ionizationTime) - theta_i_array[i]);
    if (currentDiff < smallestDiff) {
      smallestDiff = currentDiff;
      closest = i;
    }
  }
  //console.log(theta_i_array[closest])
  //console.log(energy_dict[theta_i_array[closest]])
  //console.log(theta_r_dict[theta_i_array[closest]])

  const traceColor = getColor(traceCounter - 1); // Get the latest color
  //console.log(traceColor)

  const verticalBarEnergyIon = {
    x: [theta_r_dict[theta_i_array[closest]], theta_r_dict[theta_i_array[closest]]],
    y: [0, energy_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Ionization Time ${traceCounter}`
  };

  const verticalBarEnergyRec = {
    x: [ionizationTime, ionizationTime],
    y: [0, energy_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Ionization Time ${traceCounter}`
  };

  const verticalBarRecombination = {
    x: [ionizationTime, ionizationTime],
    y: [0.5 * Math.PI, theta_r_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Ionization Time ${traceCounter}`
  };

  const horizontalBarRecombination = {
    x: [0, ionizationTime],
    y: [theta_r_dict[theta_i_array[closest]], theta_r_dict[theta_i_array[closest]]],
    mode: 'lines',
    line: { color: traceColor, width: 2 },
    name: `Ionization Time ${traceCounter}`
  };

  Plotly.addTraces('energy', [verticalBarEnergyIon, verticalBarEnergyRec]);
  Plotly.addTraces('recom-ion', [verticalBarRecombination, horizontalBarRecombination]);
  
  //console.log(energy_dict[ionizationTime]);
  //console.log(Math.max(...energy_values));

  //console.log(energy_dict)
}

function updateLegend() {
  var legendContainer = document.getElementById('legendContainer');
  legendContainer.innerHTML = '<p align="center">Legend:</p>';
  const w = 1.0; //Number(document.getElementById("w_text").value);

  for (var i = 0; i < traceCounter; i++) {
    var color = getColor(i);
    var legendItem = document.createElement('div');
    legendItem.className = 'legendItem';

    var colorBox = document.createElement('div');
    colorBox.className = 'legendColorBox';
    colorBox.style.backgroundColor = color;

    var legendText = document.createElement('div');
    legendText.textContent = "[" + color + "] -- Ionization Phase: " + (w * ionizationTimes[i]);

    legendItem.appendChild(colorBox);
    legendItem.appendChild(legendText);
    legendContainer.appendChild(legendItem);
  }
}

function cleargraphs(){
  firsttime = true;
  traceCounter = 0;
  colors = {};
  Plotly.purge("displacement");
  Plotly.purge("velocity");
  Plotly.purge("phase1");
  Plotly.purge("phase2");
  Plotly.purge("energy");
  Plotly.purge("recom-ion");

  // Clear the legend
  var legendContainer = document.getElementById('legendContainer');
  legendContainer.innerHTML = '<p align="center">Legend:</p>';
  //legendContainer.style.display = 'none'; // Hide the legend box
  
  // Clear the data
  document.getElementById("ionization_time").textContent = "";
  document.getElementById("recombination").textContent = "";
  document.getElementById("recombination_time").textContent = "";
  document.getElementById("trajectory").textContent = "";

  const w = 1.0; //Number(document.getElementById("w_text").value);
  ionize(null, w);
};

function multi(){
  
  cleargraphs();
  
  var w = 1.0;
  //var phi = 0.0;
  //var N = 15;
  //var dphi = 2. * Math.PI / (N - 1);

  /*for(let i = 0; i < N; i++){
    ionize(phi, w);
    phi += dphi;
  }*/

  for(let x = 0; x <= 2 * (Math.PI)/w; x += 0.1 * Math.PI){
    ionize(x, w);
  }
}