export default function WaitingRoom() {
    return(
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <h2 className="text-2xl font-bold">Waiting for players...</h2>
            <p className="text-gray-500">The game will start once all players are ready.</p>
        </div>
    )
}
