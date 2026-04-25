const UserBadge = ({ user }) => (
  <div className="fixed top-4 right-4 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-md">
    <p className="font-semibold text-gray-800">{user.name}</p>
    <p className="text-sm text-gray-500">{user.email}</p>
  </div>
);

export default UserBadge;
