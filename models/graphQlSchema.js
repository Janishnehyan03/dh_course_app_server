const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
} = require("graphql");

const Auth = require("./AuthModel");
const Course = require("./CourseModel");
const Creator = require("./CreatorModel");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    image: { type: GraphQLString },
  }),
});
const CourseType = new GraphQLObjectType({
  name: "Course",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    videoUrl: { type: GraphQLString },
    learners: {
      type: new GraphQLList(GraphQLID),
      resolve: (course) => course.learners.map((learner) => learner._id),
    },
    price: { type: GraphQLFloat },
    category: {
      type: GraphQLID,
      resolve: (course) => course.category._id,
    },
    creator: {
      type: GraphQLID,
      resolve: (course) => course.creator._id,
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return Auth.find({ role: { $ne: "superAdmin" } });
      },
    },
    user: {
      type: new GraphQLList(UserType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Auth.findById(args.userId);
      },
    },
    courses: {
      type: new GraphQLList(CourseType),
      resolve(parent, args) {
        return Course.find();
      },
    },
    course: {
      type: new GraphQLList(UserType),
      args: {
        courseId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Course.findById(args.courseId);
      },
    },
    creators: {
      type: new GraphQLList(UserType),

      resolve(parent, args) {
        return Creator.find();
      },
    },
    creator: {
      type: new GraphQLList(UserType),
      args: {
        creatorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Creator.findById(args.courseId);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    getAllCourses: {
      type: UserType,
      resolve(parent, args) {
        return Course.find();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
