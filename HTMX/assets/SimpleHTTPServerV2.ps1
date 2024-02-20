# Created by : https://github.com/19WAS85
# Modified by : https://github.com/akat5uki
# This is a super **SIMPLE** example of how to create a very basic powershell webserver
# For issue in PowerShell, try execute following command below:
# Unblock-File -Path SimpleHTTPServerV2.ps1
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

# Http Server
$http = [System.Net.HttpListener]::new() 

# Hostname and port to listen on
$http.Prefixes.Add("http://localhost:8080/")

# Start the Http Server 
$http.Start()

# Log ready message to terminal 
if ($http.IsListening) {
    write-host " HTTP Server Ready!  " -f 'black' -b 'gre'
    write-host "now try going to $($http.Prefixes)" -f 'y'
    # write-host "then try going to $($http.Prefixes)other/path" -f 'y'
}

# INFINTE LOOP
# Used to listen for requests
while ($http.IsListening) {

    # Get Request Url
    # When a request is made in a web browser the GetContext() method will return a request object
    # Our route examples below will use the request object properties to decide how to respond
    $context = $http.GetContext()

    # ROUTE Kill webserver
    # http://127.0.0.1/kill
    if ($context.Request.HttpMethod -eq 'GET' -and $context.Request.RawUrl -eq '/kill') {

        # We can log the request to the terminal
        write-host "$($context.Request.UserHostAddress)  =>  $($context.Request.Url)" -f 'mag'

        # the html/data you want to send to the browser
        [string]$html = "<h1>Powershell Webserver Shutdown</h1>" 
        
        #resposed to the request
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($html) # convert htmtl to bytes
        $context.Response.ContentLength64 = $buffer.Length
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length) #stream to broswer
        $context.Response.OutputStream.Close() # close the response

        break
    
    }

    # ROUTE GET root
    # http://127.0.0.1/
    if ($context.Request.HttpMethod -eq 'GET' -and $context.Request.RawUrl -eq '/') {

        # We can log the request to the terminal
        write-host "$($context.Request.UserHostAddress)  =>  $($context.Request.Url)" -f 'mag'

        # the html/data you want to send to the browser
        [string]$html = Get-Content ".\HTMX\index.html" -Raw
        
        #resposed to the request
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($html) # convert htmtl to bytes
        $context.Response.ContentLength64 = $buffer.Length
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length) #stream to broswer
        $context.Response.OutputStream.Close() # close the response
    
    }

    # ROUTE POST root
    # http://127.0.0.1/'
    if ($context.Request.HttpMethod -eq 'POST' -and $context.Request.RawUrl -eq '/') {

        # decode the form post
        # html form members need 'name' attributes as in the example!
        $FormContent = [System.IO.StreamReader]::new($context.Request.InputStream).ReadToEnd()

        # We can log the request to the terminal
        write-host "$($context.Request.UserHostAddress)  =>  $($context.Request.Url)" -f 'mag'
        write-host $FormContent -f 'Green'

        # the html/data
        [string]$html = $FormContent

        #resposed to the request
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
        $context.Response.ContentLength64 = $buffer.Length
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
        $context.Response.OutputStream.Close()
    }

    # powershell will continue looping and listen for new requests...

} 

$http.Close()