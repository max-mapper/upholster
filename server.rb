get '/' do
  File.read(File.join('public', 'pages', 'index.html'))
end

post '/provision' do
  response = {"ok" => true}
  content_type 'application/json'
  %w{username password url}.each { |input| response = {"error" => "missing #{input}"} if params[input] == "" }
  return response.to_json
  # httparty_error = "HTTParty Error!"
  # resource = params.delete('resource')
  # response = HTTParty.get(resource, :query => params) rescue httparty_error
  # return response.parsed_response rescue httparty_error
end