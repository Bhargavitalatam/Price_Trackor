import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { HistoricalDataPoint } from '../services/CryptoApiService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface HistoricalChartProps {
    data: HistoricalDataPoint[];
    symbol: string;
    days: number;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, symbol, days }) => {
    const chartData = useMemo(() => {
        return {
            labels: data.map(point => {
                if (days <= 1) return format(point.timestamp, 'HH:mm');
                if (days <= 7) return format(point.timestamp, 'MMM dd HH:mm');
                return format(point.timestamp, 'MMM dd');
            }),
            datasets: [
                {
                    label: `${symbol} Price`,
                    data: data.map(point => point.price),
                    borderColor: '#3b82f6',
                    backgroundColor: (context: ScriptableContext<'line'>) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHitRadius: 10,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                },
            ],
        };
    }, [data, symbol, days]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#1e293b',
                titleColor: '#94a3b8',
                bodyColor: '#ffffff',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                    color: '#64748b',
                    font: {
                        size: 11
                    }
                },
            },
            y: {
                position: 'right' as const,
                grid: {
                    color: 'rgba(51, 65, 85, 0.5)',
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 11
                    },
                    callback: (value: any) => {
                        return '$' + value.toLocaleString();
                    }
                },
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    };

    return (
        <div className="h-full w-full">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default HistoricalChart;
