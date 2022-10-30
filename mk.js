const discord = require("discord.js");
const dotnev = require("dotenv");
const wait = require('node:timers/promises').setTimeout;
const axios = require("axios");
dotnev.config();
require("colors");

const token = process.env.BOT_TOKEN
const prefix = process.env.PREFIX // valores estan en el archivo .env :3

const client = new discord.Client({ // definiendo client creando una constante
    intents: 131071, // este valor de intents es un calculo para obtener todos los intents
    allowedMentions: { // con esto el bot podra hacer ping a "users", "roles", "everyone".
        parse: ['users', 'roles', 'everyone'],
        repliedUser: true
      }
});
client.login(token)
// evento ready presencia
client.once("ready", async (client) => { // ready event, es un evento que tiene como parametro "client"

    console.log(`logged in as ${client.user.tag}`.brightCyan); // loggear que el bot encendio, .brightCyan es parte del modulo "colors", es para darle color a el texto en el log

    try { // try and catch function para prevenir y loggear errores, al final de un try siempre hay un catch, los try siempre son objects `{}`
        await client.user.setPresence({ // setPresence es un metodo que se utiliza para darle actividad y status a el bot
            activities: [ // activites son arrays `[]` 
                { // y dentro de activities van 3 opciones que son objects
                    name: "NETFLIX", // lo que quieras
                    type: "WATCHING", // tipo de actividad: PLAYING, COMPETING, WATCHING, LISTENING, STREAMING
                    url: null // url se especifica con string cuando el tipo de actividad es STREAMING
                }
            ],
            status: "dnd" // status: online, idle, dnd, invisible
        });
    } catch (error) {
        console.error(error);
    }
});

// event prefix commands
client.on("messageCreate", async (message) => { // messageCreate event, es un evento que se enmite cuando un mensaje es enviado, tiene como parametro "message"
// aqui se creara el codigo para establecer comandos con prefix de la siguiente manera
    try {
        if (message.author.bot) return; // con esto hacemos que el bot no responda con mensajes de otro bot
        if (message.content.startsWith(prefix)) { // si el mensaje comienza con el prefix
            const args = message.content.slice(prefix.length).trim().split(/ +/g); // con esto definimos los argumentos para hacer que cada palabra de un mensaje sea 1 argumento diferente y no todo el mensaje 1 mismo argumento
            const commandName = args.shift() // la funcion shift() sera para que el bot diferencie los argumentos de nuestro prefix y nombre de comando: !help | args...
            // comando random, numero random entre X & Y , X sera el valor minimo y Y sera el valor maximo
            if (commandName === "random") {
                const x = parseInt(args[0]);
                const y = parseInt(args[1]);
                if (!x || !y) return message.channel.send({ content: "argumentos invalidos. uso: !random <x> <y>\nx es el valor minimo, y el valor maximo"}); // ! significa no, osea, si no hay x o no hay y
                if (isNaN(x) && isNaN(y)) return message.channel.send({ content: "argumentos invalidos. uso: !random <x> <y>\nx es el valor minimo, y el valor maximo"}); // isNAN significa is not a number, si x o y no son numeros
                if (x > y) return message.channel.send({ content: "el primer numer (x) debe ser menor que el segundo numero (y)"});
                const respuesta = Math.floor(Math.random() * (y - x) + x) // math es una funcion de node que puede ser usada para muchas cosas
                message.channel.send({ content: `${respuesta}`}).catch(console.error); // al final utilizamos .catch para que el bot no se crashee con algun error al enviar el mensaje
            }
            // comando avatar, con este comando hare un embed, y respondera a diferentes nombres usando || , que significa o .por ejemplo: responder a "avatar" o "foto"
            if (commandName === "avatar" || commandName === "foto") {
                //crearemos una constante de un embed, osea lo definiremos, para luego enviarlo con message.channel.send, el metodo "send()" tiene muchas opciones que son objects `{}` en el comando anterior usamos la opcion content, en este usaremos la opcion embeds
                const user = message.mentions.users.first() || message.author // aca definimos el usuario objetivo, si no se menciona a nadie, entonces mostraremos el avatar del autor del comando
                const mkzcEmbed = new discord.MessageEmbed()
                .setAuthor({
                    name: `Avatar de ${user.username}`, // nombre del autor puede ser lo que quieras
                    iconURL: `${user.avatarURL({ dynamic: true })}`, // Image url esto es opcional, si quieres que en autor este la imagen que quieras, en este caso usare el url del usuario objetivo 
                    url: `${user.displayAvatarURL({  // url para el texto del autor, hara que el texto tenga un link, aca usaremos displayAvatarURL con todas sus opciones
                        dynamic: true, // la respuesta es Boolean, esto indica que es true o false, si es true, la imagen sera animada en el caso de ser un .gif
                        size: 1024, // tamano de la imagen en pixels
                        format: "png" // formato de la imagen en caso de que no sea animada, (la mejor es png, mas calidad), puedes usar jpg, jpeg, webp, gif, png
                    })}`
                })
                .setColor("GREEN") // color en hex o nombra un color, ejemplo, BLACK, BLUE etc
                .setImage(`${user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                    format: "png"
                })}`)
                //al final enviaremos el embed
                message.channel.send({ embeds: [mkzcEmbed]}).catch(console.error);
            }
            // siguiente comando, saludar
            if (commandName === "saludar") {
                const member = message.mentions.members.first() || message.member;
                // ahora haremos una constante que tendra un array `[]` con posibles outputs que seran strings "" que enviara el bot al usar el comando para mas variedad
                // luego haremos un simple calculo para escoger de manera aleatoria esas opciones y enviarlas 
                const options = [
                    `Kfue ${member.displayName}, ¿Cómo es?`,
                    `¿Todo bien? ${member.displayName}`,
                    `Como esta la cosa ${member.displayName}`
                ]
                const mathOptions = Math.floor(Math.random() * options.length);
                //luego usaremos un metodo sencillo para hacer que el bot aparezca escribiendo en el chat para una respuesta mas natural
                //utilizando al mismo tiempo "wait" function, permitiendo esperar para ejecutar alguna cosa. primero hay que definirlo asi para usarlo const wait = require('node:timers/promises').setTimeout;
                // pondre esto al principio del codigo
                // ahora si podemos usar wait, en node.js los tiempos estan expresados en ms, miliseconds, por eso me gusta definir el tiempo asi, 15 * 1000 = serian 15 segundos. o solamente escribir 15000
                await wait(500)
                await message.channel.sendTyping() // la funcion sendTyping se usa para que el bot escriba, se detrendra cuando el bot envie su mensaje o cuando pasen varios segundos
                await wait(1000) // otro wait para que aparezca escribiendo... por 1 segundo
                message.channel.send({ content: `${options[mathOptions]}`}).catch(console.error);
            }
            if (commandName === "joke") {
                // en este comando haremos API calls, basicamente es hacer un request a una plataforma y nos dara una respuesta
                // axios es muy buen modulo para hacer api calls, muchos api calls no requieren autorizacion pero muchas si las requieren
                // es importante leer la documentacion de la plataforma en la que usaremos su API para saber como hay que pedir autorizacion y demas.
                // con esta plataforma necesitamos autorizacion y lo haremos de la siguiente manera
                const res = await axios.get(`https://api.humorapi.com/jokes/random?max-length=450`, { //este url podemos agregar queries o parameters para filtrar nuestro request, el link base es https://api.humorapi.com/jokes/random
                    headers: {
                        "x-api-key": "324e656acdd148dca3bdfe70a63e252d" // esta es la api key del sitio, tuve que iniciar sesion y te dan tu api key
                    }
                });
                console.log(res.data) // este log es un ejemplo de el data que nos dara el request, casi siempre se usa data, luego se usara lo que queremos obtener, casi siemp respuestas seran en form JSON
                console.log(res.data.joke) // en este caso queremos encontrar "joke", entonces usamos res.data.joke
                const joke = res.data.joke
                message.channel.send({
                    embeds: [
                        new discord.MessageEmbed()
                        .setColor("GREEN")
                        .setDescription(joke)
                    ]
                });
            }
            // ahora haremos memes comando, usaremos lo mismo que antes pero enviaremos una foto, un meme
            if (commandName === "meme") {
                const res = await axios.get(`https://api.humorapi.com/memes/random?`, {
                    headers: {
                        "x-api-key": "324e656acdd148dca3bdfe70a63e252d"
                    }
                });
                console.log(res.data)
                console.log(res.data.url)
                const meme = res.data.url
                message.channel.send({
                    embeds: [
                        new discord.MessageEmbed()
                        .setColor("GREEN")
                        .setImage(meme)
                    ]
                });
            }
        };
    } catch (error) {
        console.error(error);
    };
});



