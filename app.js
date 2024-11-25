const express = require("express")
const app = express()
const PORT = 3000
const fs = require("fs")

app.set('view engine', 'ejs');
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


async function getDataUser() {
    try {
        const dataUser = await fs.promises.readFile("./dataUser.json", "utf-8")
        const manipulateData = JSON.parse(dataUser)
        return manipulateData
    }catch(err) {
        return err
    }
}

app.get("/", (req, res) => {
    res.send("AKU TERPANGGIL")
})

app.get("/home/:id", (req, res) => {
    const idData = req.params.id
    // console.log(idData, "==> final");
    const dataUser = ["ari", "amjad", "febri"]
    res.render("home", { dataUser })
})

app.get("/user", async(req, res) => {
    try{
        const manipulateData = await getDataUser()

        res.render(
            "tableUser", // ini buat manggil file ejs nya (rendernya)
            { dataUsers: manipulateData } // untuk kirim datanya
        )
        
    }catch(err) {
        console.log(err, "==> INI ERROR");
        
        res.status(500).json(err)
    }
})

app.get("/form-edit/:id", async(req, res) => {
    try {
        const idUser = req.params.id
        const result = await getDataUser()

        let dataById = result.find(el => {
            return el.id == idUser 
        })

        res.render("formEdit", {
            dataUser: dataById
        })
        
    } catch (error) {
        
    }
})

app.post("/handle-data-edit/:id", async(req, res) => {
    const idUser = req.params.id
    

    // console.log(req.body, "---> ini BODY");
    
    try {    
        
        let manipulateData = await getDataUser()

        let dataEdit = manipulateData.find(el => {
            return el.id == idUser
        })
        dataEdit.first_name = req.body.firstName
        dataEdit.last_name = req.body.last_name
        dataEdit.email = req.body.email
        dataEdit.gender = req.body.gender
        dataEdit.id = +idUser

        let dataInput = req.body
        dataInput = +idUser

        // console.log(dataEdit, "==> INI FINAL");
        
        let tampFinalData = []

        for (let index = 0; index < manipulateData.length; index++) {
            if (manipulateData[index].id == idUser) {                
                tampFinalData.push(dataInput)
            }else {
                tampFinalData.push(manipulateData[index])
            }
        }

        // console.log(tampFinalData, "==> INI FINAL DATA");
        
        // manipulateData.splice()
        // console.log(dataEdit, "===> ini data aslinya");
        let dataString = JSON.stringify(tampFinalData)

        fs.writeFileSync("./dataUser.json", dataString)

        res.status(200).json({
            message: "data berhasil ke rubah",
            data: tampFinalData
        })

    } catch (error) {
        console.log(error, "===> INI ERROR");
        
    }
})

app.get("/add-user", (req, res) => {
    res.render("formAdd")
})

app.post("/add-user", async(req, res) => {
    try {
        let allData = await getDataUser()
        let newId = allData[allData.length - 1].id + 1
    
        let newData = {
            first_name: req.body.firstName,
            last_name: req.body.last_name,
            email: req.body.email,
            gender: req.body.gender,
            id: newId
        }
    
        allData.push(newData)
        let manipulateString = JSON.stringify(allData)
        // console.log(allData, "==> INI FINAL");
        fs.writeFileSync("./dataUser.json", manipulateString)
        res.redirect("/user") 
    } catch (error) {
        res.status(500).json(error)
    }
})

app.get("/delete-user/:id", async(req, res) => {
    // res.send("aKU TERPANGGIL")
    const idUser = req.params.id
    
    try {
        let dataUser = await getDataUser()
        let newData = dataUser.filter(el => {
            return el.id !== +idUser
        })
        let manipulateData = JSON.stringify(newData)
        fs.writeFile("./dataUser.json", manipulateData, (err) => {
            if (err) {
                console.log(err);
            }
        })

        res.redirect("/user")
    }catch(err)  {
        console.log(err, "==> INI ERROR");
        
    }
})

app.listen(PORT, () => {
    console.log("aku runningf di " + PORT);
})