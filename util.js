function GetUser(){
	return client.users.find(user => user.username == input || user.id == input);
}