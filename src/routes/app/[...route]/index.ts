export async function GET({ params }: { params: { route: string } }) {
    return {
        body: {
            route: params.route
        }
    }
}