(function () {

    /**
     * D3 drawing function
     * @param  {[type]} d3
     * @param  {[type]} $element
     * @param  {Array} data
     */
     function chart(d3, $element, data) {

      var margin = {top: 100, right: 80, bottom: 30, left: 30};
      var width = 1100 - margin.left - margin.right;
      var height = 650 - margin.top - margin.bottom;

      var margin_first_text = 500;
      var margin_last_text = 60;

      var width_graph = width - margin_first_text - margin_last_text;

      var svg = d3.select("#vis")
      .append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var xScale = d3.scale.linear().range([0, width_graph]);
      var colorScale = d3.scale.category10();
      var color_ref = "red";

      var x = d3.scale.linear()
      .domain([0, 100])
      .range([0, width])
      .clamp(true);

      var div_tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

      var x0 = 0;

      data.forEach(function(d) {
        d.name = d.nom;
        d.value = +d.Impots;
        d.value0 = x0;
        x0 = x0 + d.value;


      });

      var sum_values = d3.sum(data, function(d){
        return d.value;
      });

      xScale.domain([0, sum_values]);


      var RefType = svg.append("g")
      .attr('class', 'type')
      .attr("transform", function(){return "translate(0 ,0)";});

      RefType
      .append('rect')
      .attr('height', 40)
      .attr("width", function(){return xScale(sum_values);})
      .attr('fill', color_ref)
      .attr("x", margin_first_text);

      RefType
      .append('text')
      .attr("class", "name_text")
      .attr("y", 25)
      .text("Situation de référence")
      .style("font-weight", "bold");


      RefType
      .append('text')
      .attr("class", "name_text")
      .attr("y", 25)
      .attr("x", margin_first_text + width_graph)
      .html(sum_values + " €  24,1%")
      .attr("fill", color_ref);


      RefType.select('rect')
      .on('mouseover', function() {
        var this_left_val = margin_first_text + width_graph - xScale(sum_values) + xScale(sum_values)/2;
        var this_top_val = margin.top + 50;
        div_tooltip.html('<p> Référence</p>' + '<p>' + sum_values + ' euros </p> ').style('left', this_left_val + 'px').style('top', this_top_val  + 'px').style('height', 50 + 'px').style('opacity', 0.9);
      })
      .on('mouseout', function(d) {
        div_tooltip.style('opacity', 0);
      });

      var Types_ = svg.selectAll('types')
      .data(data);

      var Types = Types_.enter()
      .append("g")
      .attr('class', 'type')
      .attr("transform", function(d, i){return "translate(0 ," + parseInt(i*43 + 50) + ")";});


      Types
      .append('rect')
      .attr('height', 40)
      .attr("width", function(d){return xScale(d.value);})
      .attr('fill', function(d){return colorScale(d.typologie);})
      .attr("x", function(d){return margin_first_text + width_graph - xScale(d.value0) - xScale(d.value);});

      Types
      .append('text')
      .attr("class", "name_text")
      .attr("y", 25)
      .attr("x", 250)
      .text(function(d){return d.Type_impact;})
      .attr("fill", function(d){return colorScale(d.typologie);})
      .style("font-size", 14);


      Types
      .append('text')
      .attr("class", "title_text")
      .attr("y", 25)
      .text(function(d){return d.title;})
      .style("font-weight", "bold");


      Types
      .append('text')
      .attr("class", "name_text")
      .attr("y", 25)
      .attr("x", margin_first_text + width_graph)
      .text(function(d){

        var minus_sign = "";
        if (d.typologie == "deduction"){
          minus_sign = "-";
        }

        var this_percentage = "";
        if (d.percentage){
          this_percentage = " " + d.percentage;
        }

        return minus_sign + d.value + " € " + this_percentage;
      })
      .attr("fill", function(d){
        return colorScale(d.typologie);
      });


      Types.select('rect')
      .on('mouseover', function(d, i) {

        var this_left_val = margin_first_text + width_graph - xScale(d.value0) - xScale(d.value)/2;
        var this_top_val = margin.top + i*43 + 50;
        var this_title = "";

        if (d.title){
          this_title  = d.title;
        }

        div_tooltip.html('<p><b>' + this_title + '</b> <br />' + d.Type_impact + '</p>' + '<p>' + d.value + ' euros </p> ').style('left', this_left_val + 'px').style('top', this_top_val  + 'px').style('height', 50 + 'px').style('opacity', 0.9);
      })
      .on('mouseout', function(d) {
        div_tooltip.style('opacity', 0);
      });
    }

    angular
    .module('codeimpot.results')
    .directive('barChart', ['d3Service', 'ResultsService', function (d3Service, ResultsService) {
      return {
        restrict: 'EA',
        scope: {},
        templateUrl: 'components/results/barchart.template.html',
        link: function(scope, element, attrs) {
          d3Service.d3().then(function (d3) {
            var data_results = ResultsService.get();
            var data = [{
              "Situation": "Situation de r\u00e9f\u00e9rence",
              "Montant net": 19254,
              "Impots": 6544,
              "Type_impact": "couple marié",
              "nom": "Mariage",
              "typologie": "deduction",
              "title":"Impacts liés au foyer fiscal"
            }, {
              "Situation": "Enfants",
              "Montant net": 12710,
              "Impots": 3015,
              "Type_impact": "deux enfants à charge",
              "nom": "enfants",
              "typologie": "deduction"
            }, {
              "Situation": "D\u00e9duction des frais professionnels",
              "Montant net": 9695,
              "Impots": 2400,
              "Type_impact": "d\u00e9duction des frais professionnels",
              "nom": "Frais pro",
              "typologie": "deduction",
              "title":"Impacts liés aux abattements"
            }, {
              "Situation": "Aux oeuvres reconnues d'utilit\u00e9 publique ou fiscalement assimil\u00e9es en mati\u00e8re de dons, aux oeuvres d'int\u00e9r\u00eat g\u00e9n\u00e9ral 7UF",
              "Montant net": 7295,
              "Impots": 1320,
              "Type_impact": "dons aux œuvres",
              "nom": "Dons",
              "typologie": "deduction",
              "title":"Impacts liés aux"
            }, {
              "Situation": "Mat\u00e9riaux d\u2019isolation thermique des parois vitr\u00e9es (fen\u00eatres, portes-fen\u00eatres\u2026)  7AM",
              "Montant net": 5975,
              "Impots": 2000,
              "Type_impact": "dépenses d'équipements pour les PH",
              "nom": "Isolation",
              "typologie": "deduction",
              "title":"réductions et crédits d’impôts"
            }, {
              "Situation": "Frais de garde des enfants de moins de 6 ans au 1\/1\/2015 7GA",
              "Montant net": 3975,
              "Impots": 2300,
              "Type_impact": "frais de garde d'enfants",
              "nom": "garde enfants",
              "typologie": "deduction"
            }, {
              "Situation": "Situation r\u00e9elle",
              "Montant net": 1675,
              "Impots": 1675,
              "nom": "A payer",
              "typologie": "reel",
              "title":"Situation réelle",
              "percentage":"3,0%"
            }];

            chart(d3, element, data);
          });
        }
      };
    }]);
  }());