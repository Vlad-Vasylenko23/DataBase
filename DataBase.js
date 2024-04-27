import pg from 'pg'
import fs from 'fs'

const { Client } = pg

const client = new Client({
    host: 'surus.db.elephantsql.com',
    port: 5432,
    database: 'vldbvhxk',
    user: 'vldbvhxk',
    password: 'FApoHGJndoMI3enz3ZxMY5QaWuwie2Vm',
});

async function createDatabaseTables() {
    try {
        await client.connect()

        await client.query(`
            CREATE TABLE IF NOT EXISTS days_of_week (
                id SERIAL PRIMARY KEY,
                day_of_week VARCHAR(20) NOT NULL
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS lesson_hours (
                id SERIAL PRIMARY KEY,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                subject_name VARCHAR(100) NOT NULL
            )
        `)

        console.log(">> Tables created successfully.")

    } catch (error) {
        console.error(">> Error creating tables:", error)
    }
}

async function importDataFromFile(filePath, tableName) {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        const jsonData = JSON.parse(data)

        for (const item of jsonData) {
            const columns = Object.keys(item).join(', ')
            const values = Object.values(item).map(val => "'" + val + "'").join(', ')

            await client.query(`
                INSERT INTO ${tableName} (${columns})
                VALUES (${values})
            `)
        }
        console.log(`>> Data imported into '${tableName}' table successfully.`)

    } catch (error) {
        console.error(">> Error importing data:", error)
    }
}

async function displayTableData(tableName) {
    try {
        const result = await client.query(`SELECT * FROM ${tableName}`)
        console.log(`>> Data from '${tableName}' table:`)
        console.log(result.rows)

    } catch (error) {
        console.error(">> Error displaying data:", error)
    }
}

async function main() {
    await createDatabaseTables()
    const tables = ['days_of_week', 'lesson_hours', 'subjects']

    for (const table of tables) {
        const hasDataInTable = await checkIfTableHasData(table)

        switch (true) {
            case hasDataInTable:
                console.log(`>> Data already exists in '${table}' table:`)
                await displayTableData(table)
                break
            default:
                await importDataFromFile(`./data/${table}.json`, table)
                break
        }
    }
    await client.end()
}

async function checkIfTableHasData(tableName) {
    try {
        const result = await client.query(`SELECT EXISTS (SELECT 1 FROM ${tableName})`)
        return result.rows[0].exists
    } catch (error) {
        console.error(">> Error checking data:", error)
        return false
    }
}

main()
