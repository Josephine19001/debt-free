require "jwt"

key_file = "/Users/josephinegyamera/gyamera-org/hair-deets/beautyscan/AuthKey_VB7VYA6558.p8"
team_id = "2AFY6WW292"
client_id = "com.lunasync.app.signin"
key_id = "VB7VYA6558"
validity_period = 180 # In days. Max 180 (6 months) according to Apple docs.

private_key = OpenSSL::PKey::EC.new IO.read key_file

token = JWT.encode(
	{
		iss: team_id,
		iat: Time.now.to_i,
		exp: Time.now.to_i + 86400 * validity_period,
		aud: "https://appleid.apple.com",
		sub: client_id
	},
	private_key,
	"ES256",
	header_fields=
	{
		kid: key_id 
	}
)
puts token
