import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import type { Transaction } from "../types";
import axiosInstance from "../services/axiosInstance";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const ExpenseCharts: React.FC = () => {
  const [pieExpenseData, setPieExpenseData] = useState<any>(null);
  const [pieIncomeData, setPieIncomeData] = useState<any>(null);
  const [lineData, setLineData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Bộ lọc ngày
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (fromDate && toDate) {
      fetchTransactions(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  const fetchTransactions = async (from: string, to: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/transactions/my-transactions?from=${from}&to=${to}`
      );

      const allTransactions: Transaction[] = response.data.items || [];

      if (allTransactions.length === 0) {
        setError("Không có dữ liệu trong khoảng thời gian này");
        setPieExpenseData(null);
        setPieIncomeData(null);
        setLineData(null);
        return;
      }

      // ----- Pie chi tiêu -----
      const expenseTransactions = allTransactions.filter((t) => t.amount < 0);
      if (expenseTransactions.length > 0) {
        const categoryExpenses = expenseTransactions.reduce(
          (acc: { [key: string]: number }, transaction) => {
            const category = transaction.categoryName;
            const amount = Math.abs(transaction.amount);
            acc[category] = (acc[category] || 0) + amount;
            return acc;
          },
          {}
        );

        setPieExpenseData({
          labels: Object.keys(categoryExpenses),
          datasets: [
            {
              data: Object.values(categoryExpenses),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
              borderWidth: 1,
            },
          ],
        });
      } else {
        setPieExpenseData(null);
      }

      // ----- Pie thu nhập -----
      const incomeTransactions = allTransactions.filter((t) => t.amount > 0);
      if (incomeTransactions.length > 0) {
        const categoryIncomes = incomeTransactions.reduce(
          (acc: { [key: string]: number }, transaction) => {
            const category = transaction.categoryName;
            const amount = transaction.amount;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
          },
          {}
        );

        setPieIncomeData({
          labels: Object.keys(categoryIncomes),
          datasets: [
            {
              data: Object.values(categoryIncomes),
              backgroundColor: [
                "#22C55E",
                "#3B82F6",
                "#F59E0B",
                "#8B5CF6",
                "#EC4899",
                "#14B8A6",
              ],
              borderWidth: 1,
            },
          ],
        });
      } else {
        setPieIncomeData(null);
      }

      // ----- Line chart (thu nhập & chi tiêu theo ngày + category) -----
      if (allTransactions.length > 0) {
        const categories = Array.from(
          new Set(allTransactions.map((t) => t.categoryName))
        );

        const dates = Array.from(
          new Set(
            allTransactions.map((t) =>
              new Date(t.occurredAt).toLocaleDateString("vi-VN")
            )
          )
        ).sort(
          (a, b) =>
            new Date(a.split("/").reverse().join("-")).getTime() -
            new Date(b.split("/").reverse().join("-")).getTime()
        );

        const colors = [
          "#22C55E", // xanh: income
          "#EF4444", // đỏ: expense
          "#3B82F6",
          "#F59E0B",
          "#8B5CF6",
          "#14B8A6",
        ];

        const datasets = categories.map((category, idx) => {
          const data = dates.map((date) => {
            const txs = allTransactions.filter(
              (t) =>
                t.categoryName === category &&
                new Date(t.occurredAt).toLocaleDateString("vi-VN") === date
            );
            // Giữ nguyên: income > 0, expense < 0
            return txs.reduce((sum, t) => sum + t.amount, 0);
          });

          return {
            label: category,
            data,
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length] + "20",
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointBackgroundColor: colors[idx % colors.length],
            pointRadius: 4,
          };
        });

        setLineData({
          labels: dates,
          datasets,
        });
      } else {
        setLineData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu biểu đồ");
    } finally {
      setLoading(false);
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum: number, current: number) => sum + current,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const formatted = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(Math.abs(value));

            if (value > 0) {
              return `+ Thu nhập (${context.dataset.label}): ${formatted}`;
            } else if (value < 0) {
              return `- Chi tiêu (${context.dataset.label}): ${formatted}`;
            } else {
              return `${context.dataset.label}: 0`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) =>
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value),
        },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Bộ lọc ngày */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-gray-700">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <button
          onClick={() => fetchTransactions(fromDate, toDate)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Lọc
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ thu & chi
          </h3>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      ) : error || (!pieExpenseData && !pieIncomeData && !lineData) ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ thu & chi
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {error || "Chưa có dữ liệu để hiển thị"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiêu theo danh mục
              </h3>
              <div className="w-full h-64">
                {pieExpenseData ? (
                  <Pie data={pieExpenseData} options={pieOptions} />
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có dữ liệu chi tiêu
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thu nhập theo danh mục
              </h3>
              <div className="w-full h-64">
                {pieIncomeData ? (
                  <Pie data={pieIncomeData} options={pieOptions} />
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có dữ liệu thu nhập
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xu hướng thu & chi (theo danh mục)
            </h3>
            <div className="h-64">
              {lineData ? (
                <Line data={lineData} options={lineOptions} />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Chưa có dữ liệu
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseCharts;
