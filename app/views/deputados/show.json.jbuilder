json.id_cadastro @deputado._id
json.extract! @deputado, :site_deputado, :nome_parlamentar, :sexo, :email
json.partido @deputado.partidos.first.sigla
json.uf @deputado.unidade_federativa.sigla
json.foto deputado.foto.url

