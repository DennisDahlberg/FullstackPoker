import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const data = [
    { session: "Session 1", profit: 50 },
    { session: "Session 2", profit: -20 },
    { session: "Session 3", profit: 80 },
    { session: "Session 4", profit: 30 },
    { session: "Session 5", profit: 120 },
];

export default function Statistics() {
    return (
        <div className="flex flex-col items-center justify-center pt-25">
            <h1 className="text-3xl font-bold mb-8">Statistics</h1>
            <div className="w-full max-w-3xl bg-gray-800/80 border-gray-700/50 pr-6 pt-6 rounded-lg">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <XAxis dataKey="session"/>
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}



