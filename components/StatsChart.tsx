import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ChartDataPoint } from '../types';

interface StatsChartProps {
  data: ChartDataPoint[];
  color: string;
}

const StatsChart: React.FC<StatsChartProps> = ({ data, color }) => {
  return (
    <div className="w-full h-96 mt-8 p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-lg font-bold mb-6 uppercase tracking-wider border-b-2 border-gray-100 pb-2">观看历史统计</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={data}
                margin={{ top: 25, right: 30, left: 20, bottom: 40 }}
            >
            <XAxis 
                dataKey="year" 
                tick={{fontSize: 12, fill: '#666'}} 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={70}
                tickMargin={10}
            />
            <YAxis hide />
            <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]}>
                <LabelList 
                    dataKey="count" 
                    position="top" 
                    offset={10}
                    style={{ fill: 'black', fontSize: 12, fontWeight: 'bold' }} 
                />
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={color} fillOpacity={0.9} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;