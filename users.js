// 1. Request file users.json.

// 2. In users.json request all users' files.

// 3. Make array of unique animals for all users.
// 	["bear","frog","smth","chicken","bear","frog","chicken","lion"] => ["bear","frog","smth","chicken","lion"]

// 4. Request files for each unique animal.

// 5. Print in console data for each user in form: "Name: <User name>. Animals: <animal icon>".

// Result in console:

// Name: Alla.
// Animals: 🐻, 🐸.

// Name: Anton.
// Animals: 🐥.

// Name: Vika.
// Animals: 🐻, 🐸, 🐥, 🦁.

const getFile = async file => {
	let request = await fetch(file);
	return request.ok ? request.json() : Promise.reject({file: file, status: request.statusText});
}

(async () => {

	try{
		// 1. Request file users.json.
		let users = await getFile(`files/users.json`);
		//console.log(users);

		// 2. In users.json request all users files.
		let eachUser = await Promise
			.allSettled(
				users.map(user => getFile(`files/${user}.json`))
			)
			.then(
				files => files.filter(file => file.status === "fulfilled").map(file => file.value)
			);

		//console.log(eachUser);

		// 3. Make array of unique animals for all users.
		let uniqueAnimals = eachUser
			.reduce((animals, user)=>{
				//console.log(animals, user);

				user.animals.forEach(userAnimal => {
					if(animals.indexOf(userAnimal) === -1)
						animals.push(userAnimal)
				})

				return animals;

			} ,[]);

		//console.log(uniqueAnimals);

		// 4. Request files for each unique animals.
		let eachAnimal = await Promise
			.allSettled(
				uniqueAnimals.map(async animal => {
					let animalFile = await getFile(`files/animals/${animal}.json`);
					animalFile.name = animal;
					
					return animalFile;
				})
			)
			.then(
				files => files.filter(file => file.status === "fulfilled").map(file => file.value)
			);

		//console.log(eachAnimal);

		// 5. Print in console data for each user in form: "Name: <User name>. Animals: <animal icon>".
		eachUser
			.forEach(user => {
				//console.log(user);
				console.log(`
					Name: ${user.name}.
					Animals: ${
						user.animals
							.filter(userAnimal => eachAnimal.find(animal => animal.name === userAnimal))
							.map(userAnimal => {
								let animalObj = eachAnimal.find(animal => animal.name === userAnimal);
								return animalObj.icon
							})
							.join(`, `)
					}
				`)
			})


	} catch(errObj){
		console.log(`
			💔 in catch
			File: ${errObj.file}
			Status: ${errObj.status}
		`)
	}

})();