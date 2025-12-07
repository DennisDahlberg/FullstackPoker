export default function PlayingCard({ value, hidden }: { value?: string; hidden?: boolean }) {
    return (
        <>
            {!hidden ? <img src={`/images/cards/${value}.png`} alt="" className="w-16" /> : <img src={`/images/cards/blue_back.png`} alt="" className="w-16" />}
        </>
    );
}