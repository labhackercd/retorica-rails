/*
#"<--- Copyright 2013 de Retórica/Davi Moreira, Luis Carli e Manoel Galdino 
# Este arquivo é parte do programa Retorica. 
# O Retorica é um software livre; você pode redistribuí-lo e/ou modificá-lo dentro 
# dos termos da [GNU General Public License OU GNU Affero General Public License] 
# como publicada pela Fundação do Software Livre (FSF); na versão 3 da Licença.
# Este programa é distribuído na esperança que possa ser útil, mas SEM NENHUMA GARANTIA; 
# sem uma garantia implícita de ADEQUAÇÃO a qualquer MERCADO ou APLICAÇÃO EM PARTICULAR. 
# Veja a licença para maiores detalhes. Você deve ter recebido uma cópia da 
# [GNU General Public License OU GNU Affero General Public License], sob o título "LICENCA.txt"
*/

d3.custom.forceLayout = function (authors) {

    var color_h = "#e9a30d";
    var color_m = "#6d9c66";
    var color_s = "#409f89";  
    
    /*loading = d3.select('body').append('div')
        .attr('class','loading')*/
    

    d3.select('.inputContainer')
        .style({
            display: 'block'
        })

    var clipData = []
    var inputData = []
    _.each(authors, function(d,i){
        _.each(d.children, function(d,i){
            if (d.id != 'NA') {
                clipData.push(d)
                inputData.push(d.author)
            }
        })
    })   

    var w = $(window).width(),
        h = 1100,
        topicCircleOpacity = 1,
        topicCircleSelOpacity = 1

    var docs = _.map(authors, function(d,i){
        return {
            topic: d.topic,
            value: d.value
        }
    })

    var rScale = d3.scale.linear()
        .domain(d3.extent(docs, function(d,i){return d.value}))
        // .domain([0,d3.max(docs, function(d,i){return d.value})])
        .range([20,120])

    var rOpenScale = d3.scale.sqrt()
        .domain(d3.extent(authors, function(d,i){return d.children.length}))
        .range([100,300])

    var cScale = d3.scale.linear()
        .domain(rScale.domain())
        .range(["hsl(163, 47%, 57%)", "hsl(163, 99%, 20%)"])
        .interpolate(d3.interpolateHcl)

    _.each(docs, function(d,i){
        d.r = rScale(d.value)
        d._r = d.r
    })

    var pack = d3.layout.pack()

    var force = d3.layout.force()
        .size([w, h])
        .gravity(0.04)
        .nodes(docs)

    var drag = force.drag()
        .on("dragstart", dragstart);

    force.start()

    ///////////////
    //DRAW////////
    /////////////

    var svg = d3.select('svg#main')
        // .append('svg')
        .attr({
            width: w, height: h
        })
        .style({
            fill: 'transparent'
        })

    //Defs
    svg.append('defs')
        .selectAll('clipPath').data(clipData)
        .enter().append('clipPath')
        .attr('id', function(d,i){
            return 'c' + d.id
        })
        .append('circle')
        .attr({
            'class': function(d,i){
                return 'clipPathCircle c' + d.id
            },
            x:0, y:0,
            r:30
        })



    //Background
    svg.append('rect')
        .attr({
            x:0, y:0, width: w, height: h
        })
        .on('click', closeTopics)

    svg = svg.append('g')
        .attr({
            transform: 'translate(60,-100)'
        })

    //Topics
    var cGroups = svg.selectAll('.cGroups').data(docs)
        .enter().append('g')
        .attr({'class': 'cGroups'})
        .style({
            cursor: 'pointer'
        })

    cGroups.append('circle')
        .attr({
            class: 'topicCircle',
            r: function(d,i){return d.r-2}
        })
        .style({
            fill: function(d,i){
              /*return cScale(d.value)*/
              return colorize(d);
            },
/*            stroke: function(d,i){
                return d3.hsl(cScale(d.value)).darker(0)
                return "3px solid #fff";
            }*/
        })
    

    cGroups.append('g')
        .attr({
            class: 'depG',
            transform: function(d,i){
                return 'translate(' + (-d.r+4) + ',' + (-d.r+4) + ')'
            }
        })
        .each(drawDep)
    
    var fo = cGroups.append('foreignObject')
        .attr({
            x: function(d,i){return -d.r+5},
            y: 0,
            width: function(d,i){return d.r*2-10},
            height: function(d,i){return d.r*2-10}
        })

    

    var topicLabel = fo.append('xhtml:div')
        .attr('class', 'topicLabel')
        .attr({
            'pointer-events': 'none'
        })
        // .style({
        //     display: function(d,i){
        //         return d.r < 30 ? 'none' : 'block'
        //     }
        // })
    
    /*topicLabel.insertBefore('<switch>')*/

    /*topicLabel.append('rect')
        .attr({
            x: function(d,i){return -d.r+5},
            y: -10,
            width: function(d,i){return d.r*2-10},
            height: 20
        })
        .style({
            /*fill: function(d,i){return cScale(d.value)},*/
            /*opacity: .6
        })*/
    
    var text = topicLabel.append('xhtml:div')
        .text(function(d,i){
            return d.topic;
        })
        .attr({
            width: 'auto',
            height: 'auto'
        })            
        .attr({
            /*x:-30, y:0, dy: '.35em',*/
            'text-anchor': 'middle'
        })
        .style({fill: '#30524d'})
        .style('font-size', function(d,i){ 
            return String(d.r/4)+'px';
        })
    
    var typeahead = $('input').typeahead({
      name: 'deputados',
      local: inputData
    })   

    topicLabel.style({
        display: function(d,i){    
            var rect = d3.select(this).select('div').node().getBoundingClientRect()
            if (d.r*2 < rect.width + 10) {
                d.label = false
                /*return 'none'*/
            } else {
                d.label = true
                /*return 'block'*/
            }
        }
    })
    
    fo.each(function(d,i) {
        var rect = d3.select(this).select('div').node().getBoundingClientRect()
        var height = String(-(rect.height/2));
        this.setAttribute('y', height);
    })
    
    /*fo.attr('y', '-50')*/

    c_before = "";

    cGroups
        .call(drag)
        .on('mouseover', function(d,i){
            c_before = d3.select(this).select('.topicCircle').style('fill');
            if (d.fixed) return
            d3.select(this)
                .select('.topicCircle')
                /*console.log(this.firstChild.getAttribute('style'));*/
                /*console.log(((d3.rgb(this.firstChild.getAttribute('style'))).brighter(0.6)).toString());*/
                .style({
                    'fill': ((d3.rgb(this.firstChild.getAttribute('style'))).brighter(0.4)).toString()
                })
            
        
            if (d.label) return
            var rect = this.getBoundingClientRect()

            var popover = d3.select('.popover2')
            popover.select('.nome')
                .text(d.topic)

            var rectPop = d3.select('.popover2').node()
                .getBoundingClientRect()

            popover.style({
                    opacity: 1,
                    left: (rect.left - rectPop.width/2 + d.r) + 'px',
                    top: (rect.top + 10 + d.r*2) + 'px'
                })

            popover.select('.tick')
                .style({
                    left: (rectPop.width/2 - 7) + 'px'
                })

        })
        .on('mouseout', function(d,i){
            /*if (d.fixed) return*/
            d3.select(this)
                .select('.topicCircle')
                .style({
                    /*'stroke-width': 0*/
                    'fill': c_before
                })   
            d3.select('.popover2')
                .style({
                    opacity: 0
                })
        })
        .on('click', function(d,i){
        
            /*this.childNodes[1].setAttribute('class', 'depG clicked');*/

            d3.select('.popover2')
                .style({
                    opacity: 0
                })

            if (d.fixed) {
                closeTopics(d,i)
                return
            }
            closeTopics(d,i)            

            d3.select('.title')
                .text(d.topic)
            d3.select('.description')
                .transition()
                .style({
                    opacity: 0
                })

            var sel = d3.select(this)

            cGroups.filter(function(d,i){return d.fixed == true})
                .selectAll('.topicCircle')
                .transition()
                .duration(900)
                .attrTween('r', rTweenSmall)
/*                .style({
                    'fill-opacity': topicCircleOpacity,
                })*/

            _.each(docs, function(d,i){
                d.fixed = false
            })

            sel.transition()
                .duration(900)
                .attrTween('transform', posTween)
                .each('end', function(d,i){return d.fixed = true})

            sel.selectAll('.topicCircle')
                .transition()
                .duration(900)
                .attrTween('r', rTweenBig)
/*                .style({
                    'fill-opacity': topicCircleSelOpacity,
                })*/

            sel.select('.topicLabel')
                .transition()
                .style({
                    opacity: 0
                })
            sel.selectAll('.depImage, .depG')
                .style({
                    display: 'block'
                })
                .transition(100)
                .delay(function(d,i){return 600 + i*10})
                .style({
                    opacity: 1
                })

            force.resume()

        })

    d3.select('svg#main')
        .append('path')
        .attr({
            d: 'M40 96 h300'
        })
        .style({
            stroke: '#97debe',
            'stroke-width': 1
        })

    function closeTopics (d,i){
        
        
        d3.select('.title')
            .text('Retórica')
        d3.select('.description')
            .transition()
            .style({
                opacity: 1
            })
        d3.select('.description2')
            .transition()
            .style({
                opacity: 0
            })

        var sel = cGroups.filter(function(d,i){return d.fixed == true})

        sel.selectAll('.topicCircle')
            .transition()
            .duration(900)
            .attrTween('r', rTweenSmall)
            .style({
                'fill-opacity': topicCircleOpacity
            })

        sel.select('.topicLabel')
            .transition()
            .delay(500)
            .style({
                opacity: 1
            })

        sel.selectAll('.depImage, .depG')
            .transition()
            .style({
                opacity: 0
            })
            .each('end', function(d,i){
                d3.select(this)
                    .style({
                        display: 'none'
                    })
            })

        force.resume()
        _.each(docs, function(d,i){
            d.fixed = false
        })
    }

    function rTweenBig (d,i) {
        var sel = d3.select(this.parentNode).select('.depG')
        var author = _.find(authors, function(d2,i2){
            return d2.topic == d.topic
        })

        var r = rOpenScale(author.children.length)
        var i = d3.interpolate(d.r, r)
        return function (t) {
            sel.each(drawDep)
            var v = i(t)
            d.r = v
            return v
        }
    }
    function rTweenSmall (d,i) {
        var sel = d3.select(this.parentNode).select('.depG')
        var i = d3.interpolate(d.r, d._r)
        return function (t) {
            sel.each(drawDep)
            var v = i(t)
            d.r = v
            return v
        }
    }
    function posTween (d,i) {
        var iX = d3.interpolate(d.x, w/2)
        var iY = d3.interpolate(d.y, h/2)
        return function (t) {
            var x = iX(t)
            var y = iY(t)
            d.x = x
            d.y = y
            return 'translate(' + d.x + ',' + d.y + ')'
        }
    }

    /////////////////

    force.on('tick', function(e){
        var q = d3.geom.quadtree(docs),
            i = 0,
            n = docs.length

        while (++i < n) {
            q.visit(collide(docs[i]));
            tick(docs[i]);
        }

        cGroups
            .attr({
                transform: function(d,i){
                    return 'translate(' + d.x + ',' + d.y + ')'
                }
            })
            .select('circle')
            .attr({
                // r: function(d,i){return d.r - 2}
            })
    })

    function drawDep (d,i){
        var sel = d3.select(this)
        sel.attr({
                transform: function(d,i){
                    return 'translate(' + (-d.r+4) + ',' + (-d.r+4) + ')'
                }
            })
        pack.size([d.r*2-8, d.r*2-8])
        var nodes = pack.nodes(_.find(authors, function(d2,i2){
            return d2.topic == d.topic
        }))

        var depCircleG = sel.selectAll('g.depCircleG').data(nodes, function(d,i){return d.id})
            
        var depCircleG_enter = depCircleG.enter().append('g')
            .attr({
                'class': 'depCircleG',
                'data-nome': function(d2,i) { return d2.author }
            })
            .on('mouseover', function(d2,i){
                if (!d.fixed) {return}
                d3.select(this).select('.depCircle')
                    .style({
                        'stroke-width': 4,
                        'stroke': '#05504c'
                    })

                var rect = this.getBoundingClientRect()

                var popover = d3.select('.popover')
                popover.select('.nome')
                    .text(d2.author)
                popover.select('.partido')
                    .text(d2.partido + ' / ' + d2.uf)

                var rectPop = d3.select('.popover').node()
                    .getBoundingClientRect()

                popover.style({
                        opacity: 1,
                        left: (rect.left - rectPop.width/2 + d2.r) + 'px',
                        top: (rect.top + 5 + d2.r*2) + 'px'
                    })

                popover.select('.tick')
                    .style({
                        left: (rectPop.width/2 - 7) + 'px'
                    })

            })
            .on('mouseleave', function(d2,i){
                if (!d.fixed) return
                d3.select(this).select('.depCircle')
                    .style({
                        'stroke-width': 0
                    })

                d3.select('.popover')
                    .style({
                        opacity: 0
                    })
            })
            .on('click', function(d2,i){
                if (!d.fixed) return
                d3.event.stopPropagation()

                d3.select('.description2 .nome')
                    .text(d2.author)
                d3.select('.description2 .partido')
                    .text(d2.partido + '/' + d2.uf)
                d3.select('.description2 .email')
                    .text(function(){
                        if (d2.email == 'NA') {
                            return 'email não disponível'
                        } else {
                            return d2.email
                        }
                    })
                d3.select('.description2 .site')
                    .attr({
                        href: d2.url
                    })

                d3.select('.description2')
                    .transition()
                    .style({
                        opacity: 1
                    })

            })
        depCircleG_enter.each(function(d,i){

            var sel = d3.select(this)
            sel.append('circle')
                .attr({
                    'class': 'depCircle'
                })
            if (d.foto != 'NA' && d.id != undefined) {
                sel.append('image')
                    .attr({
                        'class': 'depImage',
                        x:0, y:0,
                        'preserveAspectRatio': 'xMinYMin slice',
                        'xlink:href': function(){
                            return d.foto
                        },
                        'clip-path': function(){
                            return 'url(#c'+ d.id +')'
                        }
                    })
            } else {
                sel.append('image')
                    .attr({
                        'class': 'depImage',
                        x:0, y:0,
                        'preserveAspectRatio': 'xMinYMin slice',
                        'xlink:href': function(){
                            return '/assets/null.jpg'
                        },
                        'clip-path': function(){
                            return 'url(#c'+ d.id +')'
                        }
                    })
                // sel.append('rect')
                //     .attr({
                //         'class': 'depImage',
                //         x:0, y:0,
                //         'preserveAspectRatio': 'xMinYMin slice',
                //         'clip-path': function(d,i){
                //             return 'url(#c'+ d.id +')'
                //         }
                //     })
                //     .style({
                //         fill: 'white'
                //     })
            }
        })
        
        depCircleG.attr({
                transform: function(d,i){
                    return 'translate(' + d.x + ',' + d.y + ')'
                }
            })
            .style({
                display: function(d) { return d.children ? "none" : "block" }
            })
        depCircleG.select('.depCircle')
            .attr({
                // cx: function(d,i){return d.x},
                // cy: function(d,i){return d.y},
                r: function(d,i){
                    // console.log(d)
                    // return d.parent.children.length > 1 ? d.r - 2 : d.r - 4
                    return d.r - 2
                }
            })

        depCircleG.select('.depImage')
            .attr({
                x: function(d,i){return -d.r+2},
                y: function(d,i){return -d.r+2},
                width: function(d,i){return d.r*2-4},
                height: function(d,i){return d.r*2-4},
                'clip-path': function(d,i){
                    return 'url(#c'+ d.id +')'
                }
            })
            .each(function(d,i){
                var _s = '.c' + d.id
                d3.select(_s)
                .attr({
                    r: function(d,i){return d.r-2}
                })
            })

          
            

        depCircleG.exit().remove()
    }

    function dragstart () {

    }
    
    typeahead.on('typeahead:selected',function(e,data){
        cGroups.each(function(d,i) {            
            d3.select(this).selectAll('.depCircleG').each(function(){
                if(this.getAttribute('data-nome') == data.value)
                    console.log(this.parentElement.parentElement);
            });
        })
    })
  
  
    function colorize(d) {
      n = (parseInt(d.r));      
      if (n >= 50)        
        return color_h;
      else if (n < 50 && n >= 30)
        return color_m;
      else
        return color_s;
    }
  
    ax = parseInt($('#triangle').css('border-right-width'));
    ay = 0;
    bx = 0;
    by = -parseInt($('#triangle').css('border-top-width'));
  
    console.log();
  
    cx = 250;
    cy = -250;   
  
    function distance(ax,ay,bx,by) {
      return Math.sqrt(Math.pow((ax - bx),2) + Math.pow((ay - by),2));
    }
  
    function is_between(ax,ay,bx,by,x,y) {
      return (distance(ax,ay,x,y) + distance(x,y,bx,by) == distance(ax,ay,bx,by))
    }
    
    var nx = 0;
        ny = 0;
        nn = 0;

    pcx = [] //pontos de colisão x
    pcy = [] //pontos de colisão y
  
    for (nx = 0; nx <= ax; nx++) {
      for (ny = 0; ny >= by; ny--) {
        if (is_between(ax,ay,bx,by,nx,ny)) {
          pcx.push(nx);
          pcy.push(ny); 
        }
      }
    }   
    
    function tick(docs) {
      if (typeof(pcx[parseInt(docs.y)]) != "undefined"  &&  typeof(pcy[parseInt(docs.x)]) != "undefined") {
        docs.x  = Math.max(docs.r - 62, Math.min((w - 58) - docs.r, docs.x));
        docs.y = Math.max(docs.r + 98 - pcy[parseInt(docs.x)], Math.min((h + 102) - docs.r, docs.y));
      }             
    }
  

    function collide(node) {
      var r = node.r + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.r + quad.point.r;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
      };
    }


}

////////////////////////////////////
///////////////////////////////////


queue()
    // .defer(d3.csv, "data/doc_topic_one.csv")
    // .defer(d3.csv, "data/autor_topic_one.csv")
    // .defer(d3.csv, "data/autor_topic_one_enfase.csv")
    .defer(d3.json, "/deputados.json")
    .await(ready);


function ready (error, authorsEnf) {

    d3.select('.loading').transition()
        .duration(1000)
        .style('opacity','0')
        .delay(2000)
        .remove()
    // console.log(autorFinal[0])
    //docs
    // var docs = _(docs)
    //     .map(function(d,i){
    //         return {
    //             i:i,
    //             topic:d.x
    //         }
    //     })
    //     .groupBy('topic')
    //     .map(function(d,i){
    //         return {
    //             topic:i,
    //             value: d.length
    //         }
    //     })
    //     .value()

    //authors
    // var authors = _(authors)
    //     .map(function(d,i){
    //         return {
    //             author:i,
    //             topic:d.x,
    //             value:1
    //         }
    //     })
    //     .groupBy('topic')
    //     .map(function(d,i){
    //         return {
    //             topic:i,
    //             children: d
    //         }
    //     })
    //     .value()

    //authorsEnf
    var authorsEnf = _(authorsEnf)
        // .filter(function(d,i){return d.enfaze>.1})
        .map(function(d,i){
            return {
                author: d.autor,
                topic: d.rotulo,
                value: d.enfase,
                uf: d.uf,
                partido: d.partido,
                url: d.url,
                foto: d.foto,
                email: d.email,
                id: i
            }
        })
        .groupBy('topic')
        .map(function(d,i){
            return {
                topic:i,
                value: d3.sum(d, function(d,i){return d.value}),
                children: d
            }
        })
        .value()

    d3.custom.forceLayout(authorsEnf)
}
