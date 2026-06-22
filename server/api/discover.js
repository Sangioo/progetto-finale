export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    console.log('Query parameters:', query) // Log the query parameters for debugging
    return {
        hello: 'world'
    }
})