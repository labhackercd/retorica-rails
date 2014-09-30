#= require d3
#= require lodash
#= require d3.forceLayout

root = exports ? this

doTheThing = root.doTheThing = (source) ->

  $.getJSON(source).done (data) ->

    d3.select('.loading')
      .transition()
      .duration(1000)
      .style('opacity','0')
      .delay(2000)
      .remove()

    topics = _(data.topics)

    topics = topics.filter (d) ->
      (not d.ignore) and d.title.indexOf("Solenidades") != 0

    topics = topics.map (d, i) ->

      emphases = _(d.emphases)
      emphases = emphases.map (d, i) ->

        r =
          id: i
          value: d.emphasis
          author: d.name

        if d.deputado
          r.url = d.deputado.site_deputado
          r.email = d.deputado.email
          #r.foto = d.deputado.
          #if (d.deputado.foto)
          #  r['foto'] = d.deputado.foto.url;
          #r.uf = d.deputado.unidade_federativa
          #r['uf'] = d.deputado.u.url;
          #//r['partido'] = d.deputado.foto.url;
          #r['email'] = d.deputado.email;

        return r

      emphases = emphases.value()

      return {
        topic: d.title
        value: d3.sum(emphases, (d, i) -> d.value)
        children: emphases
      }

    topics = topics.value()

    d3.custom.forceLayout(topics)
