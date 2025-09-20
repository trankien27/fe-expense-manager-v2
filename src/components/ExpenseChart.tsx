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
  const [pieData, setPieData] = useState<any>(null);
  const [lineData, setLineData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchTransactions();
  }, []);

const fetchTransactions = async () => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const response = await axiosInstance.get(
      "/transactions/my-transactions?page=0&pageSize=1000"
    );

    const allTransactions: Transaction[] = response.data.items || [];

    const transactions = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.occurredAt);
      return (
        transactionDate >= startOfMonth &&
        transactionDate <= endOfMonth &&
        transaction.amount < 0
      );
    });

    if (transactions.length === 0) {
      setError("Chưa có dữ liệu chi tiêu trong tháng này");
      setLoading(false);
      return;
    }

      // ----- Pie chart (theo danh mục) -----
      const categoryExpenses = transactions.reduce(
        (acc: { [key: string]: number }, transaction) => {
          const category = transaction.categoryName;
          const amount = Math.abs(transaction.amount);
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        },
        {}
      );

      const pie = {
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
      };
      setPieData(pie);

      // ----- Line chart (theo ngày) -----
      const dailyTotals: Record<string, number> = {};
      transactions.forEach((tx) => {
        const date = new Date(tx.occurredAt).toLocaleDateString("vi-VN");
        dailyTotals[date] = (dailyTotals[date] || 0) + Math.abs(tx.amount);
      });

      const line = {
        labels: Object.keys(dailyTotals),
        datasets: [
          {
            label: "Chi tiêu theo ngày",
            data: Object.values(dailyTotals),
            borderColor: "#6366F1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#6366F1",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      };
      setLineData(line);
    } catch (err) {
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
    plugins: { legend: { display: false } },
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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ chi tiêu
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !pieData || !lineData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ chi tiêu
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">{error || "Chưa có dữ liệu để hiển thị"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phân tích chi tiêu theo danh mục
        </h3>
        <div className="w-full h-64">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Xu hướng chi tiêu trong tháng
        </h3>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;
