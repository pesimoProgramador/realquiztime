var clientId = 'Id'

if (!/^([0-9])$/.test(clientId[0])) {
    alert('Invalid Client ID - did you forget to insert your application Client ID?')
}

var realtimeUtils = new utils.RealtimeUtils({ clientId: clientId })