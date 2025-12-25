import { type LoanTier, LoanTierSection } from "@/components/loan-tier-section";

export default function Page() {
	return (
		<div className="flex min-h-screen items-center justify-center py-12">
			<LoanTierSection
				description="Choose the loan tier that fits your financial needs — with transparent rates and flexible terms."
				heading="Loan Tiers Designed for You"
				tiers={LOAN_TIERS}
			/>
		</div>
	);
}

const LOAN_TIERS: LoanTier[] = [
	{
		name: "Personal Plan",
		info: "Monthly Interest Rate",
		apr: 4.5,
		features: [
			{ text: "Minimum amount: USD 1,000" },
			{ text: "Payment Type: Partial" },
			{ text: "Payment every: 30 Days" },
			{ text: "Interval Type: Fixed" },
			{ text: "Customer Support: Email Only" },
		],
		btn: {
			text: "Get Started",
			href: "/user/loans/loan-form?tier=personal",
		},
	},
	{
		highlighted: true,
		name: "Standard Plan",
		info: "Monthly Interest Rate",
		apr: 7.2,
		features: [
			{ text: "Minimum amount: USD 10,000" },
			{ text: "Payment Type: Flexible" },
			{ text: "Payment every: 30 Days" },
			{ text: "Interval Type: Fixed" },
			{ text: "Customer Support: 24/7 Chat & Email" },
		],
		btn: {
			text: "Get Started",
			href: "/user/loans/loan-form?tier=standard",
		},
	},
	{
		name: "Executive Plan",
		info: "Monthly Interest Rate",
		apr: 9.2,
		features: [
			{ text: "Minimum amount: USD 50,000" },
			{ text: "Payment Type: Customized" },
			{ text: "Interval Type: Fixed" },
			{ text: "Loan Term: Up to 60 months" },
			{ text: "Customer Support: Dedicated Account Manager" },
		],
		btn: {
			text: "Get Started",
			href: "/user/loans/loan-form?tier=executive",
		},
	},
];