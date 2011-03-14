get '/' do
  File.read(File.join('public', 'pages', 'index.html'))
end

post '/provision' do
  if params['resource']
    content_type 'text/html'
    httparty_error = "HTTParty Error!"
    resource = params.delete('resource')
    response = HTTParty.get(resource, :query => params) rescue httparty_error
    return response.parsed_response rescue httparty_error
  end
end